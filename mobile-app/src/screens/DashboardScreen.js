import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

export default function DashboardScreen({ result, onStartChat }) {
  const { colors: C, gradient: GRAD, shadowSm } = useTheme();
  if (!result) return null;

  const score = result.match_score ?? 0;
  const isStrong = score >= 70;
  const scoreColor = isStrong ? '#10B981' : '#F59E0B';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Score Card */}
      <LinearGradient colors={GRAD} style={styles.scoreCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={styles.scoreLabel}>ATS Match Score</Text>
        <Text style={styles.scoreValue}>{score}%</Text>
        <View style={[styles.resultBadge, { backgroundColor: isStrong ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)' }]}>
          <Text style={styles.resultBadgeText}>
            {isStrong ? '✓ Strong Match' : '⚠ Needs Improvement'}
          </Text>
        </View>
      </LinearGradient>

      {/* Cheat Sheet */}
      <Text style={styles.sectionTitle}>Key Recommendations</Text>
      <View style={styles.card}>
        {result.cheat_sheet?.map((item, i) => (
          <View key={i} style={[styles.insightRow, i < result.cheat_sheet.length - 1 && styles.rowBorder]}>
            <View style={[styles.bullet, { backgroundColor: scoreColor + '22' }]}>
              <Text style={[styles.bulletNum, { color: scoreColor }]}>{i + 1}</Text>
            </View>
            <Text style={styles.insightText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity onPress={onStartChat} activeOpacity={0.85}>
        <LinearGradient colors={GRAD} style={styles.ctaBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Text style={styles.ctaText}>🎤  Start AI Interview Practice</Text>
        </LinearGradient>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 40 },
  scoreCard: {
    borderRadius: 22, padding: 28, alignItems: 'center', marginBottom: 24,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  scoreLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  scoreValue: { color: '#fff', fontSize: 72, fontWeight: '900', letterSpacing: -2 },
  resultBadge: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 8 },
  resultBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: C.text, marginBottom: 12 },
  card: {
    backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden',
    marginBottom: 24, ...shadowSm, shadowColor: '#000',
  },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  bullet: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  bulletNum: { fontSize: 13, fontWeight: '800' },
  insightText: { flex: 1, color: C.text, fontSize: 14, lineHeight: 20 },
  ctaBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
