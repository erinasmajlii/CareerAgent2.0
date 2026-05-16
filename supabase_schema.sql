-- ═══════════════════════════════════════════════════════════
-- CareerAgent 2.0 — Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up all tables.
-- ═══════════════════════════════════════════════════════════

-- ── 1. Profiles ──────────────────────────────────────────────
-- Extends Supabase auth.users with display data.
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create a profile row whenever a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 2. Analyses ───────────────────────────────────────────────
-- Stores AI gap analysis results per user.
CREATE TABLE IF NOT EXISTS public.analyses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_score  INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  cheat_sheet  JSONB DEFAULT '[]',
  jd_snippet   TEXT DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. Applications ───────────────────────────────────────────
-- Job application tracker.
CREATE TABLE IF NOT EXISTS public.applications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL,
  company     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'applied'
              CHECK (status IN ('applied', 'in_review', 'offer', 'rejected', 'active')),
  notes       TEXT DEFAULT '',
  applied_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. Prep Sessions ──────────────────────────────────────────
-- Interview practice session history.
CREATE TABLE IF NOT EXISTS public.prep_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category    TEXT NOT NULL,
  score       TEXT DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'completed'
              CHECK (status IN ('completed', 'in_progress')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- Row Level Security (RLS) — users can only access their own data
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prep_sessions ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- analyses
DROP POLICY IF EXISTS "Users can view own analyses" ON public.analyses;
CREATE POLICY "Users can view own analyses" ON public.analyses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own analyses" ON public.analyses;
CREATE POLICY "Users can insert own analyses" ON public.analyses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- applications
CREATE POLICY "Users can view own applications"
  ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own applications"
  ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications"
  ON public.applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own applications"
  ON public.applications FOR DELETE USING (auth.uid() = user_id);

-- prep_sessions
CREATE POLICY "Users can view own prep sessions"
  ON public.prep_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prep sessions"
  ON public.prep_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);