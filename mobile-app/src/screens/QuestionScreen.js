import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { createPrepSession } from '../api';

const TIPS = [
  'Use the STAR method: Situation, Task, Action, Result',
  'Think out loud during your problem-solving process',
  'Ask clarifying questions before diving in',
];

const QUESTIONS = {
  Technical: [
    { q: "How does React's virtual DOM work?",                      diff: 'Medium' },
    { q: 'What is the difference between == and === in JavaScript?', diff: 'Easy'   },
    { q: 'Explain closure in JavaScript with an example.',           diff: 'Medium' },
    { q: 'What is event delegation and why is it useful?',          diff: 'Medium' },
  ],
  'System Design': [
    { q: 'Design a URL shortening service like bit.ly.',            diff: 'Hard' },
    { q: "How would you design Twitter's timeline?",                diff: 'Hard' },
    { q: 'Design a rate limiter for a public API.',                 diff: 'Hard' },
  ],
  Behavioral: [
    { q: 'Tell me about a time you had a conflict with a coworker.', diff: 'Easy'   },
    { q: 'Describe your greatest professional challenge.',            diff: 'Medium' },
    { q: 'Give an example of how you met a tight deadline.',          diff: 'Easy'   },
  ],
  'Problem Solving': [
    { q: 'Find the two numbers in an array that sum to a target.',  diff: 'Easy' },
    { q: 'Implement a LRU Cache.',                                  diff: 'Hard' },
    { q: 'Write a function to check if a string is a palindrome.',  diff: 'Easy' },
  ],
};

const DIFF_COLORS = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444' };

export default function QuestionScreen({ route, navigation }) {
  const { colors: C, gradient: GRAD, shadowSm } = useTheme();
  const insets   = useSafeAreaInsets();
  const category = route?.params?.category || 'Technical';
  const questions = QUESTIONS[category] || QUESTIONS.Technical;

  const [index, setIndex]       = useState(0);
  const [answer, setAnswer]     = useState('');
  const [tipsOpen, setTipsOpen] = useState(false);

  const current    = questions[index];
  const diffColor  = DIFF_COLORS[current.diff] || C.primary;

  const next = async () => {
    if (answer.trim()) {
      // Save session when user submits an answer
      await createPrepSession(category, '', 'completed').catch(() => {});
    }
    if (index < questions.length - 1) {
      setIndex(index + 1);
      setAnswer('');
    } else {
      navigation.goBack();
    }
  };

  const S = getStyles(C);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[S.container, { backgroundColor: C.bg }]}
    >
      <ScrollView
        contentContainerStyle={[S.content, { paddingTop: insets.top + 16 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={S.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[S.backBtn, { backgroundColor: C.primaryLight }]}>
            <Text style={[S.backText, { color: C.primary }]}>← Back</Text>
          </TouchableOpacity>
          <View style={S.badges}>
            <View style={[S.badge, { backgroundColor: diffColor + '22' }]}>
              <Text style={[S.badgeText, { color: diffColor }]}>{current.diff}</Text>
            </View>
            <View style={[S.badge, { backgroundColor: C.primaryLight }]}>
              <Text style={[S.badgeText, { color: C.primary }]}>{category}</Text>
            </View>
          </View>
        </View>

        {/* Progress */}
        <Text style={[S.progress, { color: C.subtext }]}>{index + 1} / {questions.length}</Text>
        <View style={[S.progressBar, { backgroundColor: C.border }]}>
          <LinearGradient
            colors={GRAD}
            style={[S.progressFill, { width: `${((index + 1) / questions.length) * 100}%` }]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          />
        </View>

        {/* Question */}
        <View style={[S.questionCard, { backgroundColor: C.surface }, shadowSm]}>
          <Text style={[S.questionText, { color: C.text }]}>{current.q}</Text>
        </View>

        {/* Tips */}
        <TouchableOpacity
          style={[S.tipsToggle, { backgroundColor: C.warningLight }]}
          onPress={() => setTipsOpen(!tipsOpen)}
        >
          <Text style={[S.tipsLabel, { color: '#92400E' }]}>💡 Quick Tips</Text>
          <Text style={[S.tipsChevron, { color: '#92400E' }]}>{tipsOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {tipsOpen && (
          <View style={[S.tipsPanel, { backgroundColor: C.warningLight }]}>
            {TIPS.map((t, i) => (
              <View key={i} style={S.tipRow}>
                <Text style={[S.tipBullet, { color: '#F59E0B' }]}>•</Text>
                <Text style={[S.tipText, { color: '#78350F' }]}>{t}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Answer */}
        <Text style={[S.inputLabel, { color: C.text }]}>Your Answer</Text>
        <TextInput
          style={[S.answerInput, { backgroundColor: C.inputBg, borderColor: C.border, color: C.text }]}
          placeholder="Type your answer here..."
          placeholderTextColor={C.border}
          value={answer} onChangeText={setAnswer}
          multiline textAlignVertical="top"
        />

        {/* Next */}
        <TouchableOpacity onPress={next} activeOpacity={0.85}>
          <LinearGradient colors={GRAD} style={S.nextBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={S.nextText}>
              {index < questions.length - 1 ? 'Next Question →' : 'Finish Session ✓'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (C) => StyleSheet.create({
  container:    { flex: 1 },
  content:      { paddingHorizontal: 16, paddingBottom: 48 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn:      { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  backText:     { fontWeight: '700', fontSize: 14 },
  badges:       { flexDirection: 'row', gap: 8 },
  badge:        { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText:    { fontSize: 12, fontWeight: '700' },
  progress:     { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  progressBar:  { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 24 },
  progressFill: { height: '100%', borderRadius: 3 },
  questionCard: { borderRadius: 20, padding: 24, marginBottom: 16 },
  questionText: { fontSize: 18, fontWeight: '700', lineHeight: 28 },
  tipsToggle:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 8 },
  tipsLabel:    { fontSize: 14, fontWeight: '700' },
  tipsChevron:  { fontSize: 12 },
  tipsPanel:    { borderRadius: 14, padding: 16, marginBottom: 16 },
  tipRow:       { flexDirection: 'row', gap: 8, marginBottom: 6 },
  tipBullet:    { fontSize: 16 },
  tipText:      { fontSize: 13, lineHeight: 19, flex: 1 },
  inputLabel:   { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  answerInput:  { borderWidth: 1.5, borderRadius: 16, padding: 16, minHeight: 140, fontSize: 14, lineHeight: 22, marginBottom: 24 },
  nextBtn:      { borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  nextText:     { color: '#fff', fontSize: 16, fontWeight: '800' },
});
