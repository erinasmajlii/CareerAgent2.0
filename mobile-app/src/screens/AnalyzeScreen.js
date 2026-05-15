import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Keyboard, TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { C, GRAD, shadow, shadowSm } from '../theme';
import { analyzeGap, fetchAnalyses } from '../api';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days < 7 ? `${days}d ago` : `${Math.floor(days / 7)}w ago`;
}

export default function AnalyzeScreen() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const loadRecent = useCallback(async () => {
    setLoadingRecent(true);
    const data = await fetchAnalyses(5);
    setRecentAnalyses(data);
    setLoadingRecent(false);
  }, []);

  useEffect(() => { loadRecent(); }, [loadRecent]);

  const pickDoc = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!res.canceled && res.assets?.length > 0) setResumeFile(res.assets[0]);
  };

  const handleAnalyze = async () => {
    if (!jdText.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    try {
      const data = await analyzeGap(resumeFile?.uri, jdText);
      setResult(data);
      // Refresh recent list after new analysis
      loadRecent();
    } catch {
      setResult({ match_score: 0, cheat_sheet: ['Analysis failed. Check backend connection.'] });
    } finally { setLoading(false); }
  };

  if (result) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => setResult(null)} style={styles.backBtn}>
          <Text style={styles.backText}>← New Analysis</Text>
        </TouchableOpacity>
        <LinearGradient colors={GRAD} style={styles.scoreCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.scoreLabel}>Match Score</Text>
          <Text style={styles.scoreValue}>{result.match_score}%</Text>
          <Text style={styles.scoreSub}>{result.match_score >= 70 ? '✓ Strong Match' : '⚠ Needs Work'}</Text>
        </LinearGradient>
        <Text style={styles.sectionTitle}>Key Insights</Text>
        {result.cheat_sheet?.map((item, i) => (
          <View key={i} style={styles.insightCard}>
            <View style={styles.bullet}><Text style={styles.bulletText}>{i + 1}</Text></View>
            <Text style={styles.insightText}>{item}</Text>
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.pageTitle}>Job Analyzer</Text>
        <Text style={styles.pageSubtitle}>Analyze job descriptions and get personalized recommendations</Text>

        <TouchableOpacity onPress={pickDoc} style={[styles.uploadCard, resumeFile && styles.uploadActive]}>
          <Text style={styles.uploadIcon}>{resumeFile ? '✓' : '↑'}</Text>
          <Text style={[styles.uploadLabel, resumeFile && { color: '#10B981' }]}>
            {resumeFile ? resumeFile.name : 'Upload Your Resume'}
          </Text>
          <Text style={styles.uploadSub}>{resumeFile ? 'Tap to change' : 'PDF format · optional'}</Text>
        </TouchableOpacity>

        <Text style={styles.inputLabel}>Job Description</Text>
        <TextInput
          style={styles.jdInput}
          placeholder="Paste the full job description here..."
          placeholderTextColor={C.border}
          value={jdText}
          onChangeText={setJdText}
          multiline textAlignVertical="top"
        />

        <TouchableOpacity onPress={handleAnalyze} disabled={!jdText.trim() || loading} activeOpacity={0.85}>
          <LinearGradient
            colors={!jdText.trim() ? ['#C4C4C4', '#C4C4C4'] : GRAD}
            style={styles.analyzeBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.analyzeBtnText}>🔍  Analyze Job</Text>}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recent Analyses</Text>
        </View>
        <View style={styles.card}>
          {loadingRecent ? (
            <ActivityIndicator color={C.primary} style={{ padding: 20 }} />
          ) : recentAnalyses.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: C.subtext, fontSize: 13 }}>No analyses yet. Run your first one above!</Text>
            </View>
          ) : (
            recentAnalyses.map((r, i) => {
              const color = r.match_score >= 70 ? '#10B981' : '#F59E0B';
              return (
                <View key={r.id} style={[styles.recentRow, i < recentAnalyses.length - 1 && styles.rowBorder]}>
                  <View style={styles.recentIcon}><Text>📄</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recentRole}>{r.role || 'Gap Analysis'}</Text>
                    <Text style={styles.recentCompany}>{r.company || 'Unknown company'} · {timeAgo(r.created_at)}</Text>
                  </View>
                  <View style={[styles.pctBadge, { backgroundColor: color + '22' }]}>
                    <Text style={[styles.pctText, { color }]}>{r.match_score}%</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 6 },
  pageSubtitle: { fontSize: 14, color: C.subtext, marginBottom: 20, lineHeight: 20 },
  uploadCard: {
    borderWidth: 2, borderColor: C.border, borderStyle: 'dashed',
    borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20, backgroundColor: C.surface,
  },
  uploadActive: { borderColor: '#10B981', borderStyle: 'solid', backgroundColor: '#ECFDF5' },
  uploadIcon: { fontSize: 32, marginBottom: 8 },
  uploadLabel: { color: C.text, fontSize: 15, fontWeight: '700' },
  uploadSub: { color: C.subtext, fontSize: 12, marginTop: 4 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 8 },
  jdInput: {
    backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 14, padding: 16, minHeight: 140,
    fontSize: 14, color: C.text, lineHeight: 22, marginBottom: 20,
  },
  analyzeBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 24 },
  analyzeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: C.text },
  card: { backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', ...shadowSm, shadowColor: '#000' },
  recentRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  recentIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' },
  recentRole: { color: C.text, fontSize: 13, fontWeight: '600' },
  recentCompany: { color: C.subtext, fontSize: 12, marginTop: 2 },
  pctBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  pctText: { fontSize: 13, fontWeight: '700' },
  backBtn: { marginBottom: 20, alignSelf: 'flex-start', backgroundColor: C.primaryLight, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  backText: { color: C.primary, fontWeight: '700' },
  scoreCard: { borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 24, ...shadow },
  scoreLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  scoreValue: { color: '#fff', fontSize: 64, fontWeight: '900' },
  scoreSub: { color: 'rgba(255,255,255,0.9)', fontSize: 15, marginTop: 4 },
  insightCard: {
    flexDirection: 'row', backgroundColor: C.surface, borderRadius: 14,
    padding: 16, marginBottom: 10, gap: 12, ...shadowSm, shadowColor: '#000',
  },
  bullet: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  bulletText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  insightText: { color: C.text, flex: 1, fontSize: 14, lineHeight: 20 },
});
