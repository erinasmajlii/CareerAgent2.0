import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, FlatList,
  StyleSheet, Keyboard, TouchableWithoutFeedback, ActivityIndicator, ScrollView
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { analyzeGap } from '../api';

const QUICK_ROLES = ['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'DevOps Engineer'];

export default function HomeScreen() {
  const [jdText, setJdText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeView, setActiveView] = useState('input'); // input | result

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (!res.canceled && res.assets?.length > 0) {
        setResumeFile(res.assets[0]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (e) { console.log(e); }
  };

  const handleInfiltrate = async () => {
    if (!jdText.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Keyboard.dismiss();
    setLoading(true);
    try {
      const data = await analyzeGap(resumeFile?.uri, jdText);
      setResult(data);
      setActiveView('result');
    } catch (e) {
      alert('Analysis failed. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setJdText('');
    setResumeFile(null);
    setActiveView('input');
  };

  if (activeView === 'result' && result) {
    return <ResultView result={result} onReset={handleReset} />;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>[ SYSTEM READY ]</Text>
          <Text style={styles.heroTitle}>CareerAgent</Text>
          <Text style={styles.heroSubtitle}>Drop your resume. Paste the JD. Let AI do the rest.</Text>
        </View>

        <Text style={styles.sectionLabel}>QUICK ROLE TAGS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsRow}>
          {QUICK_ROLES.map(role => (
            <TouchableOpacity key={role} style={styles.tag} onPress={() => setJdText(role + ' - ')}>
              <Text style={styles.tagText}>{role}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionLabel}>JOB DESCRIPTION</Text>
        <TextInput
          style={styles.jdInput}
          placeholder="Paste the full job description here..."
          placeholderTextColor="#444"
          value={jdText}
          onChangeText={setJdText}
          multiline
          returnKeyType="done"
          blurOnSubmit
        />

        <Text style={styles.sectionLabel}>RESUME</Text>
        <TouchableOpacity style={[styles.resumeBox, resumeFile && styles.resumeBoxActive]} onPress={handlePickDocument}>
          <Text style={styles.resumeIcon}>{resumeFile ? '✓' : '↑'}</Text>
          <Text style={[styles.resumeText, resumeFile && styles.resumeTextActive]}>
            {resumeFile ? resumeFile.name : 'Tap to select PDF resume'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ctaButton, (!jdText.trim() || loading) && styles.ctaDisabled]}
          onPress={handleInfiltrate}
          disabled={!jdText.trim() || loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.ctaText}>[ INFILTRATE ]</Text>
          }
        </TouchableOpacity>

        {loading && (
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>▶ Connecting to Ghost Network...</Text>
            <Text style={styles.statusText}>▶ Running gap analysis via Gemini...</Text>
          </View>
        )}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

function ResultView({ result, onReset }) {
  const isGood = result.match_score >= 70;
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.scoreCard, isGood ? styles.scoreCardGood : styles.scoreCardWarn]}>
        <Text style={styles.scoreCardLabel}>MATCH SCORE</Text>
        <Text style={[styles.scoreCardValue, isGood ? styles.colorMatrix : styles.colorWarning]}>
          {result.match_score}%
        </Text>
        <Text style={styles.scoreCardSub}>{isGood ? 'Strong Match' : 'Needs Work'}</Text>
      </View>

      <Text style={styles.sectionLabel}>THE CHEAT SHEET</Text>
      {result.cheat_sheet.map((item, i) => (
        <View key={i} style={styles.cheatCard}>
          <View style={styles.cheatIndex}><Text style={styles.cheatIndexText}>{i + 1}</Text></View>
          <Text style={styles.cheatCardText}>{item}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.resetButton} onPress={onReset}>
        <Text style={styles.resetButtonText}>← Run New Analysis</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const C = { green: '#00FF41', amber: '#FFBF00', bg: '#000', card: '#0D0D0D', border: '#1A1A1A', muted: '#555' };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { padding: 20, paddingBottom: 40 },
  hero: { marginBottom: 28, borderLeftWidth: 3, borderLeftColor: C.green, paddingLeft: 14 },
  heroLabel: { color: C.green, fontSize: 10, letterSpacing: 3, marginBottom: 4, opacity: 0.7 },
  heroTitle: { color: C.green, fontSize: 30, fontWeight: '900', letterSpacing: 2 },
  heroSubtitle: { color: C.muted, fontSize: 13, marginTop: 4, lineHeight: 18 },
  sectionLabel: { color: C.muted, fontSize: 10, letterSpacing: 3, marginBottom: 8, marginTop: 20 },
  tagsRow: { flexDirection: 'row', marginBottom: 4 },
  tag: { borderWidth: 1, borderColor: C.green, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, borderRadius: 2 },
  tagText: { color: C.green, fontSize: 11, letterSpacing: 1 },
  jdInput: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    color: '#ccc', padding: 16, minHeight: 140, textAlignVertical: 'top',
    fontSize: 14, lineHeight: 22, borderRadius: 4,
  },
  resumeBox: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderStyle: 'dashed', borderRadius: 4, gap: 12,
  },
  resumeBoxActive: { borderColor: C.amber, borderStyle: 'solid' },
  resumeIcon: { color: C.green, fontSize: 22, width: 28, textAlign: 'center' },
  resumeText: { color: C.muted, fontSize: 13, flex: 1 },
  resumeTextActive: { color: C.amber },
  ctaButton: {
    marginTop: 28, backgroundColor: C.green, paddingVertical: 18,
    alignItems: 'center', borderRadius: 4,
  },
  ctaDisabled: { opacity: 0.35 },
  ctaText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 3 },
  statusBox: { marginTop: 18, padding: 14, backgroundColor: C.card, borderLeftWidth: 3, borderLeftColor: C.green },
  statusText: { color: C.green, fontSize: 12, marginBottom: 4, opacity: 0.8 },
  scoreCard: { padding: 28, alignItems: 'center', borderRadius: 6, marginBottom: 24, borderWidth: 1 },
  scoreCardGood: { borderColor: C.green, backgroundColor: 'rgba(0,255,65,0.05)' },
  scoreCardWarn: { borderColor: C.amber, backgroundColor: 'rgba(255,191,0,0.05)' },
  scoreCardLabel: { color: C.muted, fontSize: 10, letterSpacing: 3, marginBottom: 8 },
  scoreCardValue: { fontSize: 80, fontWeight: '900' },
  scoreCardSub: { color: C.muted, fontSize: 13, marginTop: 4 },
  colorMatrix: { color: C.green },
  colorWarning: { color: C.amber },
  cheatCard: {
    flexDirection: 'row', backgroundColor: C.card, borderRadius: 4,
    padding: 16, marginBottom: 12, alignItems: 'flex-start', gap: 12,
    borderWidth: 1, borderColor: C.border,
  },
  cheatIndex: { width: 24, height: 24, backgroundColor: C.amber, borderRadius: 2, alignItems: 'center', justifyContent: 'center' },
  cheatIndexText: { color: '#000', fontWeight: '900', fontSize: 12 },
  cheatCardText: { color: '#ccc', flex: 1, fontSize: 14, lineHeight: 20 },
  resetButton: { marginTop: 24, padding: 16, borderWidth: 1, borderColor: C.border, alignItems: 'center', borderRadius: 4 },
  resetButtonText: { color: C.green, fontSize: 14, letterSpacing: 1 },
});
