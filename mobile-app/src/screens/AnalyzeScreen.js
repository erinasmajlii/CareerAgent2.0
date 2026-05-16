import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../context/ThemeContext';
import { analyzeGap, fetchAnalyses } from '../api';

// Sample placeholder cards for an empty state
const SAMPLE_ANALYSES = [
  { id: 's1', company: 'Google',    role: 'AI Engineer',         score: 85, tag: 'Sample' },
  { id: 's2', company: 'Meta',      role: 'Product Manager',     score: 72, tag: 'Sample' },
  { id: 's3', company: 'Stripe',    role: 'Frontend Engineer',   score: 91, tag: 'Sample' },
];

function timeAgo(d) {
  if (!d) return '';
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m/60)}h ago`;
  return `${Math.floor(m/1440)}d ago`;
}

export default function AnalyzeScreen() {
  const { colors: C, gradient: GRAD, shadowSm, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [file, setFile]       = useState(null);
  const [jd, setJd]           = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [recent, setRecent]   = useState([]);
  const [lr, setLr]           = useState(true);

  const glassBox = [
    styles.glassBox,
    isDark
      ? { backgroundColor: 'rgba(139,127,255,0.07)', borderColor: 'rgba(139,127,255,0.35)', shadowColor: '#8B7FFF', shadowOpacity: 0.4, shadowRadius: 18 }
      : { backgroundColor: '#fff', borderColor: C.border, ...shadowSm },
  ];

  const loadRecent = useCallback(async () => {
    setLr(true);
    const data = await fetchAnalyses(5);
    setRecent(data); setLr(false);
  }, []);

  useEffect(() => { loadRecent(); }, [loadRecent]);

  const pickDoc = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!res.canceled && res.assets?.length) setFile(res.assets[0]);
  };

  const analyze = async () => {
    if (!jd.trim()) return;
    Keyboard.dismiss(); setLoading(true);
    try {
      const data = await analyzeGap(file?.uri, jd);
      setResult(data); loadRecent();
    } catch {
      setResult({ match_score: 0, cheat_sheet: ['Analysis failed. Please check connection.'] });
    } finally { setLoading(false); }
  };

  // ── Result ──────────────────────────────────────────────────────────────
  if (result) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={[styles.content, { paddingTop: insets.top + 68, paddingBottom: 110 }]}>
        <TouchableOpacity onPress={() => setResult(null)} style={[styles.backBtn, { backgroundColor: C.primaryLight }]}>
          <Text style={{ color: C.primary, fontWeight: '700' }}>← New Analysis</Text>
        </TouchableOpacity>
        <LinearGradient colors={GRAD} style={styles.scoreCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.scoreLabel}>ATS Match Score</Text>
          <Text style={styles.scoreValue}>{result.match_score}%</Text>
        </LinearGradient>
        <Text style={[styles.sectionTitle, { color: C.text }]}>Key Insights</Text>
        {result.cheat_sheet?.map((item, i) => (
          <View key={i} style={[...glassBox, { flexDirection: 'row', gap: 12, marginBottom: 10 }]}>
            <View style={[styles.bullet, { backgroundColor: C.primary }]}><Text style={{ color: '#fff', fontWeight: '800' }}>{i+1}</Text></View>
            <Text style={{ flex: 1, color: C.text, fontSize: 14, lineHeight: 20 }}>{item}</Text>
          </View>
        ))}
      </ScrollView>
    );
  }

  // ── Input ───────────────────────────────────────────────────────────────
  const displayRecent = recent.length > 0 ? recent : null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: 110 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.pageTitle, { color: C.text }]}>Analyze Job</Text>
      <Text style={[styles.pageSub, { color: C.subtext }]}>Upload your resume & paste the job description</Text>

      {/* ── Prominent Glass Upload Box ───────────────────────────── */}
      <TouchableOpacity onPress={pickDoc} activeOpacity={0.85}>
        <View style={[
          ...glassBox,
          styles.uploadBox,
          file && { borderColor: '#10B981', borderStyle: 'solid', shadowColor: '#10B981' },
        ]}>
          {isDark && (
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          )}
          <LinearGradient
            colors={file ? ['rgba(16,185,129,0.15)', 'rgba(16,185,129,0.05)'] : ['rgba(139,127,255,0.12)', 'rgba(108,99,255,0.04)']}
            style={styles.uploadGrad}
          >
            <View style={[styles.uploadIconWrap, { backgroundColor: file ? '#10B98133' : 'rgba(139,127,255,0.2)', shadowColor: file ? '#10B981' : '#8B7FFF', shadowOpacity: 0.6, shadowRadius: 16, shadowOffset: { width: 0, height: 0 }, elevation: 0 }]}>
              <Text style={{ fontSize: 32 }}>{file ? '✓' : '↑'}</Text>
            </View>
            <Text style={[styles.uploadTitle, { color: file ? '#10B981' : C.text }]}>
              {file ? file.name : 'Upload Your Resume'}
            </Text>
            <Text style={[styles.uploadSub, { color: C.subtext }]}>
              {file ? 'Tap to change file' : 'PDF · Drag & drop or tap to browse'}
            </Text>
            {!file && (
              <View style={[styles.uploadPillBtn, { backgroundColor: isDark ? 'rgba(139,127,255,0.2)' : C.primaryLight, borderColor: C.primary, borderWidth: 1 }]}>
                <Text style={[styles.uploadPillText, { color: C.primary }]}>Browse Files</Text>
              </View>
            )}
          </LinearGradient>
        </View>
      </TouchableOpacity>

      {/* JD Input */}
      <Text style={[styles.inputLabel, { color: C.text }]}>Job Description</Text>
      <TextInput
        style={[
          styles.jdInput,
          { backgroundColor: isDark ? 'rgba(139,127,255,0.06)' : C.inputBg, borderColor: isDark ? 'rgba(139,127,255,0.3)' : C.border, color: C.text },
        ]}
        placeholder="Paste the full job description here..."
        placeholderTextColor={C.subtext}
        value={jd} onChangeText={setJd}
        multiline textAlignVertical="top"
      />

      <TouchableOpacity onPress={analyze} disabled={!jd.trim() || loading} activeOpacity={0.85}>
        <LinearGradient
          colors={!jd.trim() ? ['#555', '#555'] : GRAD}
          style={styles.analyzeBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.analyzeBtnText}>🔍  Analyze Job</Text>}
        </LinearGradient>
      </TouchableOpacity>

      {/* Recent Analyses */}
      <Text style={[styles.sectionTitle, { color: C.text }]}>Recent Analyses</Text>
      {lr ? (
        <ActivityIndicator color={C.primary} />
      ) : (
        (displayRecent || SAMPLE_ANALYSES).map((r, i) => {
          const isSample = !r.created_at;
          const score    = r.match_score ?? r.score;
          const color    = score >= 80 ? '#10B981' : score >= 65 ? '#F59E0B' : '#EF4444';
          const title    = r.role || 'Gap Analysis';
          const company  = r.company || (r.jd_snippet ? r.jd_snippet.slice(0, 28) + '…' : '—');
          return (
            <View key={r.id} style={[...glassBox, { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10, opacity: isSample ? 0.65 : 1 }]}>
              <View style={[styles.recentIcon, { backgroundColor: color + '22' }]}>
                <Text style={{ fontSize: 18 }}>📄</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.text }}>{company} · {title}</Text>
                <Text style={{ fontSize: 12, color: C.subtext, marginTop: 2 }}>
                  {isSample ? '(Sample)' : timeAgo(r.created_at)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <View style={[styles.pctBadge, { backgroundColor: color + '22' }]}>
                  <Text style={{ fontSize: 14, fontWeight: '900', color }}>{score}%</Text>
                </View>
                <Text style={{ fontSize: 10, color: C.subtext }}>Match</Text>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content:        { paddingHorizontal: 18 },
  pageTitle:      { fontSize: 24, fontWeight: '800', marginBottom: 5, letterSpacing: -0.5 },
  pageSub:        { fontSize: 13, marginBottom: 22, lineHeight: 19 },
  glassBox:       { borderRadius: 20, borderWidth: 1.5, overflow: 'hidden', marginBottom: 16 },
  uploadBox:      { borderStyle: 'dashed', minHeight: 180 },
  uploadGrad:     { padding: 28, alignItems: 'center', gap: 12 },
  uploadIconWrap: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  uploadTitle:    { fontSize: 16, fontWeight: '800' },
  uploadSub:      { fontSize: 12, textAlign: 'center' },
  uploadPillBtn:  { borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8, marginTop: 4 },
  uploadPillText: { fontSize: 13, fontWeight: '700' },
  inputLabel:     { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  jdInput:        { borderWidth: 1.5, borderRadius: 16, padding: 16, minHeight: 120, fontSize: 14, lineHeight: 22, marginBottom: 18 },
  analyzeBtn:     { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 28, shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  analyzeBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  sectionTitle:   { fontSize: 17, fontWeight: '800', marginBottom: 12, letterSpacing: -0.2 },
  recentIcon:     { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  pctBadge:       { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  bullet:         { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  backBtn:        { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 20 },
  scoreCard:      { borderRadius: 24, padding: 30, alignItems: 'center', marginBottom: 24 },
  scoreLabel:     { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 6 },
  scoreValue:     { color: '#fff', fontSize: 64, fontWeight: '900', letterSpacing: -2 },
});
