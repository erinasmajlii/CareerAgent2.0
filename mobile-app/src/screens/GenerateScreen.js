import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { C, GRAD, shadow, shadowSm } from '../theme';

const IMPROVEMENTS = [
  'Add measurable results, e.g. "Improved ATS score by 30%"',
  'Quantified achievements match 80% of job requirements',
  'Add more quantifiable results for leadership section',
  'Formatting optimized for ATS parsing',
];

const RECENT = [
  { name: 'Senior_Developer_Resume.pdf', pct: 92, time: '2h ago', color: '#10B981' },
  { name: 'Staff_Engineer_Resume.pdf', pct: 88, time: '1d ago', color: '#10B981' },
  { name: 'Lead_Dev_Resume.pdf', pct: 76, time: '3d ago', color: '#F59E0B' },
];

export default function GenerateScreen() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobUrl, setJobUrl] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 0, text: "Hi! I've generated your optimized resume with 92% ATS match. You can ask me to add, remove, or modify any section.", sender: 'ai' },
  ]);
  const [input, setInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const pickDoc = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!res.canceled && res.assets?.length > 0) setResumeFile(res.assets[0]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAiLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: 'I\'ve updated your resume based on that feedback. The ATS score remains strong at 91%.', sender: 'ai' }]);
      setAiLoading(false);
    }, 1200);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Resume Generator</Text>
        <Text style={styles.pageSubtitle}>Upload resume and analyze job listings</Text>

        {/* Upload */}
        <TouchableOpacity onPress={pickDoc} style={[styles.uploadCard, resumeFile && styles.uploadActive]}>
          <Text style={styles.uploadIcon}>{resumeFile ? '✓' : '↑'}</Text>
          <Text style={[styles.uploadLabel, resumeFile && { color: '#10B981' }]}>
            {resumeFile ? resumeFile.name : 'Upload Your Resume'}
          </Text>
          <Text style={styles.uploadSub}>{resumeFile ? 'PDF uploaded' : 'PDF, DOCX up to 10MB'}</Text>
        </TouchableOpacity>

        {/* ATS Score */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreCardTitle}>ATS Match Score</Text>
            <Text style={styles.scoreNumber}>92%</Text>
          </View>
          <View style={styles.scoreBarBg}>
            <LinearGradient colors={['#10B981', '#34D399']} style={[styles.scoreBarFill, { width: '92%' }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
          </View>
          <Text style={styles.scoreHint}>Job Posting: 85% match</Text>
        </View>

        {/* Job URL */}
        <Text style={styles.inputLabel}>Job Posting URL</Text>
        <TextInput
          style={styles.urlInput}
          placeholder="https://jobs.company.com/..."
          placeholderTextColor={C.border}
          value={jobUrl}
          onChangeText={setJobUrl}
          autoCapitalize="none"
        />

        {/* Download */}
        <TouchableOpacity activeOpacity={0.85}>
          <LinearGradient colors={['#10B981', '#059669']} style={styles.downloadBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.downloadText}>⬇  Download PDF</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Key Improvements */}
        <Text style={styles.sectionTitle}>Key Improvements</Text>
        <View style={styles.card}>
          {IMPROVEMENTS.map((item, i) => (
            <View key={i} style={[styles.impRow, i < IMPROVEMENTS.length - 1 && styles.rowBorder]}>
              <Text style={styles.impDot}>•</Text>
              <Text style={styles.impText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Recent Analyses */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recent Analyses</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
        </View>
        <View style={styles.card}>
          {RECENT.map((r, i) => (
            <View key={i} style={[styles.recentRow, i < RECENT.length - 1 && styles.rowBorder]}>
              <View style={styles.recentIcon}><Text>📄</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.recentName}>{r.name}</Text>
                <Text style={styles.recentTime}>{r.time}</Text>
              </View>
              <View style={[styles.pctBadge, { backgroundColor: r.color + '22' }]}>
                <Text style={[styles.pctText, { color: r.color }]}>{r.pct}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* AI Assistant Toggle */}
        <TouchableOpacity onPress={() => setChatOpen(!chatOpen)} activeOpacity={0.85}>
          <LinearGradient colors={GRAD} style={styles.aiBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.aiBtnText}>{chatOpen ? '✕ Close' : '✦ AI Assistant'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* AI Chat Panel */}
        {chatOpen && (
          <View style={styles.chatPanel}>
            <ScrollView style={styles.chatMessages} contentContainerStyle={{ padding: 12 }}>
              {messages.map(m => (
                <View key={m.id} style={[styles.bubble, m.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
                  <Text style={[styles.bubbleText, m.sender === 'user' ? styles.userText : styles.aiText]}>{m.text}</Text>
                </View>
              ))}
              {aiLoading && <ActivityIndicator color={C.primary} style={{ alignSelf: 'flex-start', margin: 8 }} />}
            </ScrollView>
            <View style={styles.chatInput}>
              <TextInput
                style={styles.chatTextInput}
                placeholder="Ask AI to edit your resume..."
                placeholderTextColor={C.border}
                value={input}
                onChangeText={setInput}
              />
              <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
                <LinearGradient colors={GRAD} style={styles.sendGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>→</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 6 },
  pageSubtitle: { fontSize: 14, color: C.subtext, marginBottom: 20 },
  uploadCard: {
    borderWidth: 2, borderColor: C.border, borderStyle: 'dashed',
    borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16, backgroundColor: C.surface,
  },
  uploadActive: { borderColor: '#10B981', borderStyle: 'solid', backgroundColor: '#ECFDF5' },
  uploadIcon: { fontSize: 32, marginBottom: 8 },
  uploadLabel: { color: C.text, fontSize: 15, fontWeight: '700' },
  uploadSub: { color: C.subtext, fontSize: 12, marginTop: 4 },
  scoreCard: { backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 16, ...shadowSm, shadowColor: '#000' },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  scoreCardTitle: { color: C.text, fontSize: 15, fontWeight: '700' },
  scoreNumber: { color: '#10B981', fontSize: 22, fontWeight: '900' },
  scoreBarBg: { height: 8, backgroundColor: C.border, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  scoreBarFill: { height: '100%', borderRadius: 4 },
  scoreHint: { color: C.subtext, fontSize: 12 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 8 },
  urlInput: {
    backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 14, color: C.text, marginBottom: 14,
  },
  downloadBtn: { borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 24 },
  downloadText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: C.text, marginBottom: 10 },
  seeAll: { color: C.primary, fontSize: 13, fontWeight: '600' },
  card: { backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', marginBottom: 20, ...shadowSm, shadowColor: '#000' },
  impRow: { flexDirection: 'row', padding: 14, gap: 10, alignItems: 'flex-start' },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  impDot: { color: C.primary, fontSize: 18, lineHeight: 20 },
  impText: { color: C.text, fontSize: 13, lineHeight: 19, flex: 1 },
  recentRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  recentIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' },
  recentName: { color: C.text, fontSize: 13, fontWeight: '600' },
  recentTime: { color: C.subtext, fontSize: 12, marginTop: 2 },
  pctBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  pctText: { fontSize: 13, fontWeight: '700' },
  aiBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  aiBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  chatPanel: { backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', ...shadowSm, shadowColor: '#000', marginBottom: 12 },
  chatMessages: { maxHeight: 220 },
  bubble: { maxWidth: '80%', borderRadius: 14, padding: 12, marginBottom: 8 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: C.primaryLight },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#F3F4F6' },
  bubbleText: { fontSize: 13, lineHeight: 19 },
  userText: { color: C.primary },
  aiText: { color: C.text },
  chatInput: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.border, padding: 10, gap: 8, alignItems: 'center' },
  chatTextInput: { flex: 1, backgroundColor: C.bg, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: C.text },
  sendBtn: { width: 40, height: 40 },
  sendGrad: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
