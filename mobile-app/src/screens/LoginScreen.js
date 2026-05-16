import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, Switch, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const RATE_MAX  = 5;
const RATE_WIN  = 15 * 60 * 1000;

const PWD_RULES = [
  { label: '8+ characters',      test: (p) => p.length >= 8 },
  { label: 'Uppercase letter',   test: (p) => /[A-Z]/.test(p) },
  { label: 'Number',             test: (p) => /[0-9]/.test(p) },
  { label: 'Special character',  test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function PwdBar({ password, C, isDark }) {
  const passed = PWD_RULES.filter((r) => r.test(password)).length;
  const barColor = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'][Math.max(0, passed - 1)] ?? C.border;
  return (
    <View style={{ marginTop: 12 }}>
      <View style={{ flexDirection: 'row', gap: 4, marginBottom: 8 }}>
        {PWD_RULES.map((r, i) => (
          <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: r.test(password) ? barColor : isDark ? 'rgba(255,255,255,0.08)' : C.border }} />
        ))}
      </View>
      {PWD_RULES.map((r, i) => (
        <Text key={i} style={{ fontSize: 11, color: r.test(password) ? '#10B981' : C.subtext, marginTop: 2 }}>
          {r.test(password) ? '✓' : '○'}  {r.label}
        </Text>
      ))}
    </View>
  );
}

export default function LoginScreen() {
  const { signIn, signUp }                           = useAuth();
  const { colors: C, gradient: GRAD, isDark, toggleTheme } = useTheme();
  const insets                                        = useSafeAreaInsets();

  const [mode, setMode]       = useState('login');
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [fullName, setName]   = useState('');
  const [showPass, setShow]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [locked, setLocked]   = useState(false);
  const [secs, setSecs]       = useState(0);
  const attempts = useRef([]);
  const timerRef = useRef(null);

  const checkRate = () => {
    const now = Date.now();
    attempts.current = attempts.current.filter((t) => now - t < RATE_WIN);
    if (attempts.current.length >= RATE_MAX) {
      const wait = Math.ceil((attempts.current[0] + RATE_WIN - now) / 1000);
      setLocked(true); setSecs(wait);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSecs((s) => { if (s <= 1) { clearInterval(timerRef.current); setLocked(false); attempts.current = []; return 0; } return s - 1; });
      }, 1000);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    if (locked) { setError(`Too many attempts. Wait ${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`); return; }
    if (!email.trim() || !password.trim()) { setError('Email and password are required.'); return; }
    if (mode === 'signup') {
      if (!fullName.trim()) { setError('Full name is required.'); return; }
      if (!PWD_RULES.every((r) => r.test(password))) { setError('Password does not meet all requirements.'); return; }
    }
    if (!checkRate()) return;
    attempts.current.push(Date.now());
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        const data = await signUp(email.trim(), password, fullName.trim());
        if (data?.user && !data.session) {
          Alert.alert('Check your email', `Confirmation sent to ${email.trim()}.`);
        }
      }
    } catch (e) { setError(e.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#080810' : C.bg }}>
      {/* Background glow orbs */}
      {isDark && (
        <>
          <View style={[styles.orb, styles.orb1]} />
          <View style={[styles.orb, styles.orb2]} />
        </>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 32, paddingBottom: 48 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Theme Toggle */}
          <View style={styles.topRow}>
            <View style={{ flex: 1 }} />
            <View style={styles.themeRow}>
              <Text style={{ fontSize: 14 }}>{isDark ? '🌙' : '☀️'}</Text>
              <Switch
                value={isDark} onValueChange={toggleTheme}
                trackColor={{ false: C.border, true: 'rgba(139,127,255,0.5)' }}
                thumbColor={isDark ? '#8B7FFF' : '#6C63FF'}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
          </View>

          {/* Logo */}
          <View style={styles.logoWrap}>
            <LinearGradient colors={GRAD} style={[styles.logoBox, isDark && { shadowColor: '#8B7FFF', shadowOpacity: 0.8, shadowRadius: 24, shadowOffset: { width: 0, height: 0 }, elevation: 0 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={{ fontSize: 36, color: '#fff' }}>✦</Text>
            </LinearGradient>
            <Text style={[styles.logoLabel, { color: isDark ? '#8B7FFF' : C.primary }]}>CareerAgent</Text>
            {isDark && <Text style={[styles.logoSub, { color: C.subtext }]}>Cyber-Lounge Edition</Text>}
          </View>

          <Text style={[styles.heading, { color: C.text }]}>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</Text>
          <Text style={[styles.subheading, { color: C.subtext }]}>
            {mode === 'login' ? 'Sign in to your command center' : 'Join your career co-pilot'}
          </Text>

          {/* Form Card */}
          <View style={[styles.formCard, isDark ? { backgroundColor: 'rgba(139,127,255,0.05)', borderColor: 'rgba(139,127,255,0.25)', borderWidth: 1 } : { backgroundColor: '#fff', shadowColor: '#6C63FF', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 3 }]}>
            {mode === 'signup' && (
              <>
                <Text style={[styles.label, { color: C.subtext }]}>FULL NAME</Text>
                <TextInput style={[styles.input, { color: C.text, borderBottomColor: C.border }]} placeholder="Sarah Johnson" placeholderTextColor={C.border} value={fullName} onChangeText={setName} autoCapitalize="words" />
              </>
            )}
            <Text style={[styles.label, { color: C.subtext }]}>EMAIL</Text>
            <TextInput style={[styles.input, { color: C.text, borderBottomColor: C.border }]} placeholder="you@company.com" placeholderTextColor={C.border} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Text style={[styles.label, { color: C.subtext }]}>PASSWORD</Text>
            <View style={[styles.passRow, { borderBottomColor: C.border }]}>
              <TextInput style={[styles.passInput, { color: C.text }]} placeholder="••••••••" placeholderTextColor={C.border} value={password} onChangeText={setPass} secureTextEntry={!showPass} />
              <TouchableOpacity onPress={() => setShow(!showPass)} style={{ padding: 8 }}>
                <Text style={{ fontSize: 16 }}>{showPass ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
            {mode === 'signup' && password.length > 0 && <PwdBar password={password} C={C} isDark={isDark} />}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {locked && (
            <View style={[styles.rateBanner, { backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2', borderColor: isDark ? 'rgba(239,68,68,0.4)' : '#FCA5A5' }]}>
              <Text style={[styles.rateText, { color: '#EF4444' }]}>🔒 Too many attempts — {Math.floor(secs/60)}:{String(secs%60).padStart(2,'0')}</Text>
            </View>
          )}
          {mode === 'login' && (
            <TouchableOpacity style={styles.forgotWrap}>
              <Text style={[{ color: C.primary, fontSize: 13, fontWeight: '600' }]}>Forgot password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={handleSubmit} disabled={loading || locked} activeOpacity={0.85} style={{ opacity: locked ? 0.5 : 1 }}>
            <LinearGradient colors={GRAD} style={styles.submitBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{mode === 'login' ? '✦  Sign In' : '✦  Create Account'}</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={{ color: C.subtext, fontSize: 14 }}>{mode === 'login' ? "Don't have an account? " : 'Already have one? '}</Text>
            <TouchableOpacity onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setPass(''); }}>
              <Text style={{ color: C.primary, fontWeight: '800', fontSize: 14 }}>{mode === 'login' ? 'Sign up' : 'Sign in'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  content:     { paddingHorizontal: 24 },
  topRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  themeRow:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  logoWrap:    { alignItems: 'center', marginBottom: 28 },
  logoBox: {
    width: 80, height: 80, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12, elevation: 0,
  },
  logoLabel:   { fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  logoSub:     { fontSize: 10, fontWeight: '600', letterSpacing: 1, marginTop: 2 },
  heading:     { fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 6, letterSpacing: -0.5 },
  subheading:  { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  formCard:    { borderRadius: 20, padding: 20, marginBottom: 16 },
  label:       { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, marginTop: 16 },
  input:       { fontSize: 15, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  passRow:     { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  passInput:   { flex: 1, fontSize: 15, paddingVertical: 10 },
  errorText:   { color: '#EF4444', fontSize: 13, textAlign: 'center', marginBottom: 12 },
  rateBanner:  { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 12 },
  rateText:    { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  forgotWrap:  { alignSelf: 'flex-end', marginBottom: 20 },
  submitBtn: {
    borderRadius: 16, paddingVertical: 17, alignItems: 'center', marginBottom: 28,
    shadowColor: '#8B7FFF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 16, elevation: 8,
  },
  submitText:  { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  footer:      { flexDirection: 'row', justifyContent: 'center' },
  // Dark bg orbs
  orb: { position: 'absolute', borderRadius: 999, opacity: 0.25 },
  orb1: { width: 260, height: 260, backgroundColor: '#6C63FF', top: -60, left: -80, transform: [{ scaleX: 1.5 }] },
  orb2: { width: 200, height: 200, backgroundColor: '#8B7FFF', bottom: 100, right: -60, transform: [{ scaleX: 1.3 }] },
});
