import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { C, GRAD, shadowSm } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

const CATEGORIES = [
  { icon: '💻', label: 'Technical', count: 45, bg: '#EEF0FF', iconBg: C?.primary },
  { icon: '🏗', label: 'System Design', count: 20, bg: '#ECFDF5', iconBg: '#10B981' },
  { icon: '🧠', label: 'Behavioral', count: 30, bg: '#FEF3C7', iconBg: '#F59E0B' },
  { icon: '🔧', label: 'Problem Solving', count: 18, bg: '#FEE2E2', iconBg: '#EF4444' },
];

const HISTORY = [
  { session: 'System Design Session', status: 'Completed', score: '8/10', date: '2 days ago', color: '#10B981' },
  { session: 'Behavioral Questions', status: 'Completed', score: '7/10', date: '4 days ago', color: '#10B981' },
  { session: 'Design Session', status: 'In Progress', score: '4/10', date: '1 week ago', color: '#F59E0B' },
];

const TODAY_Q = 'Explain the difference between let, var, and const in JavaScript.';

export default function PrepScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Interview Prep</Text>
      <Text style={styles.pageSubtitle}>Practice with AI-generated questions</Text>

      {/* Categories Grid */}
      <Text style={styles.sectionTitle}>Question Categories</Text>
      <View style={styles.grid}>
        {CATEGORIES.map((cat, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.catCard, { backgroundColor: cat.bg }]}
            onPress={() => navigation.navigate('Question', { category: cat.label })}
            activeOpacity={0.8}
          >
            <Text style={styles.catIcon}>{cat.icon}</Text>
            <Text style={styles.catLabel}>{cat.label}</Text>
            <Text style={styles.catCount}>{cat.count} questions</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Today's Practice */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Today's Practice</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Question', { category: 'Technical' })}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.todayCard}
        onPress={() => navigation.navigate('Question', { category: 'Technical' })}
        activeOpacity={0.85}
      >
        <LinearGradient colors={GRAD} style={styles.todayGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.todayBadge}>
            <Text style={styles.todayBadgeText}>Technical · Easy</Text>
          </View>
          <Text style={styles.todayQ}>{TODAY_Q}</Text>
          <Text style={styles.todayAction}>Start Practice →</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Practice History */}
      <Text style={styles.sectionTitle}>Practice History</Text>
      <View style={styles.card}>
        {HISTORY.map((h, i) => (
          <View key={i} style={[styles.histRow, i < HISTORY.length - 1 && styles.rowBorder]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.histSession}>{h.session}</Text>
              <Text style={styles.histDate}>{h.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <View style={[styles.statusBadge, { backgroundColor: h.color + '20' }]}>
                <Text style={[styles.statusText, { color: h.color }]}>{h.status}</Text>
              </View>
              <Text style={styles.histScore}>{h.score}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 6 },
  pageSubtitle: { fontSize: 14, color: C.subtext, marginBottom: 20 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: C.text, marginBottom: 10 },
  seeAll: { color: C.primary, fontSize: 13, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  catCard: {
    width: '47%', borderRadius: 16, padding: 18,
    ...shadowSm, shadowColor: '#000',
  },
  catIcon: { fontSize: 32, marginBottom: 10 },
  catLabel: { color: C.text, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  catCount: { color: C.subtext, fontSize: 12 },
  todayCard: { borderRadius: 18, overflow: 'hidden', marginBottom: 24, ...shadowSm },
  todayGrad: { padding: 20 },
  todayBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 12 },
  todayBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  todayQ: { color: '#fff', fontSize: 16, fontWeight: '700', lineHeight: 24, marginBottom: 16 },
  todayAction: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '600' },
  card: { backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', ...shadowSm, shadowColor: '#000' },
  histRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  histSession: { color: C.text, fontSize: 14, fontWeight: '600' },
  histDate: { color: C.subtext, fontSize: 12, marginTop: 2 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  histScore: { color: C.primary, fontSize: 13, fontWeight: '700' },
});
