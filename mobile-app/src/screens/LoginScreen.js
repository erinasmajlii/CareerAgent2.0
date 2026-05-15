import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, GRAD, shadowSm } from '../theme';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    if (mode === 'signup' && !fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
        // Navigation happens automatically via RootNavigator auth state change
      } else {
        const data = await signUp(email.trim(), password, fullName.trim());
        if (data?.user && !data.session) {
          // Email confirmation required
          Alert.alert(
            'Check your email',
            'We sent a confirmation link to ' + email.trim() + '. Click it to activate your account.',
          );
        }
      }
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoWrap}>
          <LinearGradient colors={GRAD} style={styles.logo} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.logoIcon}>✦</Text>
          </LinearGradient>
        </View>

        <Text style={styles.heading}>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</Text>
        <Text style={styles.subheading}>
          {mode === 'login' ? 'Sign in to continue your career journey' : 'Start your career journey today'}
        </Text>

        {/* Full Name (sign-up only) */}
        {mode === 'signup' && (
          <>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Sarah Johnson"
              placeholderTextColor={C.border}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </>
        )}

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="john@example.com"
          placeholderTextColor={C.border}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.passWrap}>
          <TextInput
            style={styles.passInput}
            placeholder="••••••••"
            placeholderTextColor={C.border}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
            <Text style={{ fontSize: 16 }}>{showPass ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        </View>

        {/* Error message */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {mode === 'login' && (
          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgot}>Forgot password?</Text>
          </TouchableOpacity>
        )}

        {/* Submit button */}
        <TouchableOpacity onPress={handleSubmit} activeOpacity={0.85} disabled={loading}>
          <LinearGradient colors={GRAD} style={styles.signInBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.signInText}>{mode === 'login' ? 'Sign In' : 'Create Account'}</Text>}
          </LinearGradient>
        </TouchableOpacity>

        {/* Toggle mode */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          </Text>
          <TouchableOpacity onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
            <Text style={[styles.footerText, { color: C.primary, fontWeight: '700' }]}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 28, paddingTop: 64, paddingBottom: 40 },
  logoWrap: { alignItems: 'center', marginBottom: 28 },
  logo: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  logoIcon: { fontSize: 34, color: '#fff' },
  heading: { fontSize: 28, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 8 },
  subheading: { fontSize: 15, color: C.subtext, textAlign: 'center', marginBottom: 28 },
  label: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: C.text, ...shadowSm,
  },
  passWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 12, ...shadowSm,
  },
  passInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: C.text },
  eyeBtn: { paddingHorizontal: 14 },
  errorText: { color: C.danger, fontSize: 13, marginTop: 12, textAlign: 'center' },
  forgotWrap: { alignSelf: 'flex-end', marginTop: 10, marginBottom: 24 },
  forgot: { color: C.primary, fontSize: 13, fontWeight: '600' },
  signInBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  signInText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: C.subtext, fontSize: 14 },
});
