import axios from 'axios';
import { supabase } from './supabase';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:8000/api';

// Helper: always attach the current user's JWT for FastAPI calls
async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper: get current authenticated user id
async function currentUserId() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

// ──────────────────────────────────────────────────────────────
// AI: GAP ANALYSIS  (FastAPI + Gemini backend)
// ──────────────────────────────────────────────────────────────
export const analyzeGap = async (resumeUri, jdText) => {
  const formData = new FormData();

  if (resumeUri) {
    formData.append('resume_file', {
      uri: resumeUri,
      name: 'resume.pdf',
      type: 'application/pdf',
    });
  }
  formData.append('jd_text', jdText || 'No job description provided.');

  try {
    const headers = await authHeaders();
    const response = await axios.post(`${API_BASE}/analyze`, formData, {
      headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      transformRequest: (data) => data,
    });
    const result = response.data;

    // Persist the result in Supabase for history
    const userId = await currentUserId();
    if (userId && result?.match_score !== undefined) {
      await supabase.from('analyses').insert({
        user_id: userId,
        match_score: result.match_score,
        cheat_sheet: result.cheat_sheet ?? [],
        jd_snippet: jdText?.slice(0, 200) ?? '',
      });
    }

    return result;
  } catch (error) {
    console.error('[API analyzeGap]', error.message);
    return {
      match_score: 0,
      cheat_sheet: [
        'Could not reach the analysis backend.',
        'Make sure the FastAPI server is running and EXPO_PUBLIC_API_BASE is set correctly.',
        'Run: cd backend && uvicorn main:app --reload',
      ],
    };
  }
};

// ──────────────────────────────────────────────────────────────
// AI: GHOST INTERVIEWER CHAT  (FastAPI + Gemini backend)
// ──────────────────────────────────────────────────────────────
export const chatWithInterviewer = async (message, analysisContext, history = []) => {
  try {
    const headers = await authHeaders();
    const { data } = await axios.post(
      `${API_BASE}/chat`,
      { message, analysis_context: analysisContext, history },
      { headers }
    );
    return data?.reply ?? 'No response.';
  } catch (e) {
    console.error('[API chatWithInterviewer]', e.message);
    return 'Connection lost. The interviewer hung up.';
  }
};

// ──────────────────────────────────────────────────────────────
// ANALYSES  (Supabase — direct query, no backend needed)
// ──────────────────────────────────────────────────────────────
export const fetchAnalyses = async (limit = 10) => {
  try {
    const userId = await currentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('analyses')
      .select('id, match_score, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Supabase fetchAnalyses]', error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.error('[fetchAnalyses]', e.message);
    return [];
  }
};

// ──────────────────────────────────────────────────────────────
// APPLICATIONS  (Supabase — direct query)
// ──────────────────────────────────────────────────────────────
export const fetchApplications = async (limit = 20) => {
  try {
    const userId = await currentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('applications')
      .select('id, role, company, status, notes, applied_at')
      .eq('user_id', userId)
      .order('applied_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Supabase fetchApplications]', error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.error('[fetchApplications]', e.message);
    return [];
  }
};

export const createApplication = async (role, company, status = 'applied', notes = '') => {
  try {
    const userId = await currentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('applications')
      .insert({ user_id: userId, role, company, status, notes, applied_at: new Date().toISOString() })
      .select()
      .single();

    if (error) {
      console.error('[Supabase createApplication]', error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.error('[createApplication]', e.message);
    return null;
  }
};

export const updateApplicationStatus = async (id, status) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Supabase updateApplicationStatus]', error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.error('[updateApplicationStatus]', e.message);
    return null;
  }
};

// ──────────────────────────────────────────────────────────────
// PREP SESSIONS  (Supabase — direct query)
// ──────────────────────────────────────────────────────────────
export const fetchPrepSessions = async (limit = 10) => {
  try {
    const userId = await currentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('prep_sessions')
      .select('id, category, score, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Supabase fetchPrepSessions]', error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.error('[fetchPrepSessions]', e.message);
    return [];
  }
};

export const createPrepSession = async (category, score = '', status = 'completed') => {
  try {
    const userId = await currentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('prep_sessions')
      .insert({ user_id: userId, category, score, status })
      .select()
      .single();

    if (error) {
      console.error('[Supabase createPrepSession]', error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.error('[createPrepSession]', e.message);
    return null;
  }
};

// ──────────────────────────────────────────────────────────────
// PROFILE  (Supabase — direct query)
// ──────────────────────────────────────────────────────────────
export const fetchProfile = async () => {
  try {
    const userId = await currentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[Supabase fetchProfile]', error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.error('[fetchProfile]', e.message);
    return null;
  }
};
