import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, GRAD, shadowSm } from '../theme';

const TIPS = [
  'Use the STAR method: Situation, Task, Action, Result',
  'Think out loud during your problem-solving process',
  'Ask clarifying questions before diving in',
];

const QUESTIONS = {
  Technical: [
    { q: "How does React's virtual DOM work?", diff: 'Medium' },
    { q: 'What is the difference between == and === in JavaScript?', diff: 'Easy' },
    { q: 'Explain closure in JavaScript with an example.', diff: 'Medium' },
  ],
  'System Design': [
    { q: 'Design a URL shortening service like bit.ly.', diff: 'Hard' },
    { q: 'How would you design Twitter\'s timeline?', diff: 'Hard' },
  ],
  Behavioral: [
    { q: 'Tell me about a time you had a conflict with a coworker.', diff: 'Easy' },
    { q: 'Describe your greatest professional challenge.', diff: 'Medium' },
  ],
  'Problem Solving': [
    { q: 'Find the two numbers in an array that sum to a target.', diff: 'Easy' },
    { q: 'Implement a LRU Cache.', diff: 'Hard' },
  ],
};

export default function QuestionScreen({ route, navigation }) {
  const category = route?.params?.category || 'Technical';
  const questions = QUESTIONS[category] || QUESTIONS.Technical;
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [tipsOpen, setTipsOpen] = useState(false);

  const current = questions[index];
  const diffColor = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444' }[current.diff] || '#6C63FF';

  const next = () => {
    if (index < questions.length - 1) { setIndex(index + 1); setAnswer(''); }
    else navigation.goBack();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: diffColor + '22' }]}>
              <Text style={[styles.badgeText, { color: diffColor }]}>{current.diff}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: C.primaryLight }]}>
              <Text style={[styles.badgeText, { color: C.primary }]}>{category}</Text>
            </View>
          </View>
        </View>

        {/* Progress */}
        <Text style={styles.progress}>{index + 1} / {questions.length}</Text>
        <View style={styles.progressBar}>
          <LinearGradient colors={GRAD} style={[styles.progressFill, { width: `${((index + 1) / questions.length) * 100}%` }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
        </View>

        {/* Question */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{current.q}</Text>
        </View>

        {/* Quick Tips */}
        <TouchableOpacity style={styles.tipsToggle} onPress={() => setTipsOpen(!tipsOpen)}>
          <Text style={styles.tipsLabel}>💡 Quick Tips</Text>
          <Text style={styles.tipsChevron}>{tipsOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {tipsOpen && (
          <View style={styles.tipsPanel}>
            {TIPS.map((t, i) => (
              <View key={i} style={styles.tipRow}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>{t}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Answer Input */}
        <Text style={styles.inputLabel}>Your Answer</Text>
        <TextInput
          style={styles.answerInput}
          placeholder="Type your answer here..."
          placeholderTextColor={C.border}
          value={answer}
          onChangeText={setAnswer}
          multiline
          textAlignVertical="top"
        />

        {/* Next Button */}
        <TouchableOpacity onPress={next} activeOpacity={0.85}>
          <LinearGradient colors={GRAD} style={styles.nextBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.nextText}>
              {index < questions.length - 1 ? 'Next Question →' : 'Finish Session ✓'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backBtn: { backgroundColor: C.primaryLight, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  backText: { color: C.primary, fontWeight: '700', fontSize: 14 },
  badges: { flexDirection: 'row', gap: 8 },
  badge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  progress: { color: C.subtext, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  progressBar: { height: 6, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden', marginBottom: 20 },
  progressFill: { height: '100%', borderRadius: 3 },
  questionCard: {
    backgroundColor: C.surface, borderRadius: 18, padding: 22, marginBottom: 16,
    ...shadowSm, shadowColor: '#000',
  },
  questionText: { color: C.text, fontSize: 18, fontWeight: '700', lineHeight: 28 },
  tipsToggle: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFFBEB', borderRadius: 12, padding: 14, marginBottom: 8,
  },
  tipsLabel: { color: '#92400E', fontSize: 14, fontWeight: '600' },
  tipsChevron: { color: '#92400E', fontSize: 12 },
  tipsPanel: { backgroundColor: '#FFFBEB', borderRadius: 12, padding: 14, marginBottom: 16 },
  tipRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  tipBullet: { color: '#F59E0B', fontSize: 16 },
  tipText: { color: '#78350F', fontSize: 13, lineHeight: 19, flex: 1 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 8 },
  answerInput: {
    backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 14, padding: 16, minHeight: 130,
    fontSize: 14, color: C.text, lineHeight: 22, marginBottom: 20,
  },
  nextBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
