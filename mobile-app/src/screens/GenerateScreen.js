import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Switch, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../context/ThemeContext';
import { analyzeGap } from '../api';

export default function GenerateScreen() {
  const { colors: C, gradient: GRAD, shadowSm, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [mode, setMode]         = useState('text');   // 'linkedin' | 'text'
  const [linkedinUrl, setUrl]   = useState('');
  const [rawText, setRaw]       = useState('');
  const [resumeFile, setFile]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);

  const pickDoc = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!res.canceled && res.assets?.length) setFile(res.assets[0]);
  };

  const handleOptimize = async () => {
    const jd = mode === 'linkedin' ? `LinkedIn URL: ${linkedinUrl}` : rawText;
    if (!jd.trim()) { Alert.alert('Missing Input', 'Please provide a job description or LinkedIn URL.'); return; }
    setLoading(true);
    try {
      const data = await analyzeGap(resumeFile?.uri, jd);
      setResult(data);
    } catch { Alert.alert('Error', 'Optimization failed. Check your connection.'); }
    finally { setLoading(false); }
  };

  const S = getStyles(C);

  const cardStyle = [
    S.card,
    { backgroundColor: C.surface },
    isDark ? { borderWidth: 1, borderColor: 'rgba(139,127,255,0.2)' } : shadowSm,
  ];

  // ── Result view ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <ScrollView style={[S.container, { backgroundColor: C.bg }]} contentContainerStyle={[S.content, { paddingTop: insets.top + 68 }]}>
        <Text style={[S.pageTitle, { color: C.text }]}>Optimization Result</Text>
        <LinearGradient colors={GRAD} style={S.scoreCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={S.scoreLabel}>ATS Match</Text>
          <Text style={S.scoreValue}>{result.match_score}%</Text>
        </LinearGradient>
        {result.cheat_sheet?.map((item, i) => (
          <View key={i} style={[...cardStyle, { flexDirection: 'row', gap: 12, marginBottom: 10 }]}>
            <View style={[S.bullet, { backgroundColor: C.primary }]}><Text style={{ color: '#fff', fontWeight: '800' }}>{i + 1}</Text></View>
            <Text style={[{ flex: 1, fontSize: 14, lineHeight: 20, color: C.text }]}>{item}</Text>
          </View>
        ))}
        <TouchableOpacity onPress={() => setResult(null)} activeOpacity={0.85}>
          <LinearGradient colors={GRAD} style={S.mainBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={S.mainBtnText}>✦  Optimize Again</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ── Input view ───────────────────────────────────────────────────────────
  return (
    <ScrollView
      style={[S.container, { backgroundColor: C.bg }]}
      contentContainerStyle={[S.content, { paddingTop: insets.top + 20 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[S.pageTitle, { color: C.text }]}>Resume Optimizer</Text>
      <Text style={[S.pageSubtitle, { color: C.subtext }]}>AI-powered ATS optimization for your next role</Text>

      {/* Upload */}
      <TouchableOpacity
        onPress={pickDoc}
        style={[
          S.uploadCard,
          { backgroundColor: C.surface, borderColor: resumeFile ? '#10B981' : C.border },
          isDark && !resumeFile ? { borderColor: 'rgba(139,127,255,0.3)' } : null,
        ]}
      >
        <Text style={S.uploadIcon}>{resumeFile ? '✓' : '↑'}</Text>
        <Text style={[S.uploadLabel, { color: resumeFile ? '#10B981' : C.text }]}>
          {resumeFile ? resumeFile.name : 'Upload Resume (PDF)'}
        </Text>
        <Text style={[S.uploadSub, { color: C.subtext }]}>{resumeFile ? 'Tap to change' : 'optional — improves results'}</Text>
      </TouchableOpacity>

      {/* Mode Toggle */}
      <View style={[S.toggleRow, { backgroundColor: isDark ? 'rgba(139,127,255,0.1)' : C.primaryLight, borderColor: C.border }]}>
        {['linkedin', 'text'].map((m) => (
          <TouchableOpacity
            key={m}
            onPress={() => setMode(m)}
            activeOpacity={0.8}
            style={[S.toggleBtn, mode === m && { backgroundColor: C.primary }]}
          >
            <Text style={[S.toggleText, { color: mode === m ? '#fff' : C.subtext }]}>
              {m === 'linkedin' ? '🔗 LinkedIn URL' : '📄 Paste Text'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input Area */}
      {mode === 'linkedin' ? (
        <TextInput
          style={[S.input, { backgroundColor: C.inputBg, borderColor: C.border, color: C.text }]}
          placeholder="https://linkedin.com/jobs/view/..."
          placeholderTextColor={C.border}
          value={linkedinUrl} onChangeText={setUrl}
          autoCapitalize="none" keyboardType="url"
        />
      ) : (
        <TextInput
          style={[S.textarea, { backgroundColor: C.inputBg, borderColor: C.border, color: C.text }]}
          placeholder="Paste the full job description here for best results..."
          placeholderTextColor={C.border}
          value={rawText} onChangeText={setRaw}
          multiline textAlignVertical="top"
        />
      )}

      <TouchableOpacity onPress={handleOptimize} disabled={loading} activeOpacity={0.85}>
        <LinearGradient
          colors={loading ? ['#C4C4C4', '#C4C4C4'] : GRAD}
          style={S.mainBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={S.mainBtnText}>✦  Optimize Resume</Text>}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const getStyles = (C) => StyleSheet.create({
  container:    { flex: 1 },
  content:      { paddingHorizontal: 20, paddingBottom: 110 },
  pageTitle:    { fontSize: 24, fontWeight: '800', marginBottom: 6, letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 14, marginBottom: 24, color: C.subtext },
  card:         { borderRadius: 16, padding: 14 },
  uploadCard:   { borderWidth: 2, borderStyle: 'dashed', borderRadius: 18, padding: 28, alignItems: 'center', marginBottom: 20 },
  uploadIcon:   { fontSize: 30, marginBottom: 8 },
  uploadLabel:  { fontSize: 15, fontWeight: '700' },
  uploadSub:    { fontSize: 12, marginTop: 4 },
  toggleRow:    { flexDirection: 'row', borderRadius: 14, padding: 4, marginBottom: 16, borderWidth: 1 },
  toggleBtn:    { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 11 },
  toggleText:   { fontSize: 13, fontWeight: '600' },
  input: {
    borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 14, marginBottom: 20,
  },
  textarea: {
    borderWidth: 1.5, borderRadius: 16, padding: 16, minHeight: 130,
    fontSize: 14, lineHeight: 22, marginBottom: 20,
  },
  mainBtn: {
    borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 24,
    shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5,
  },
  mainBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  scoreCard:   { borderRadius: 22, padding: 30, alignItems: 'center', marginBottom: 20 },
  scoreLabel:  { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 6 },
  scoreValue:  { color: '#fff', fontSize: 60, fontWeight: '900', letterSpacing: -2 },
  bullet:      { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
