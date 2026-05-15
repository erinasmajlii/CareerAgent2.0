import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { C, GRAD, shadowSm } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchPrepSessions } from '../api';

const CATEGORIES = [
  { icon: '💻', label: 'Technical', count: 45, bg: '#EEF0FF' },
  { icon: '🏗', label: 'System Design', count: 20, bg: '#ECFDF5' },
  { icon: '🧠', label: 'Behavioral', count: 30, bg: '#FEF3C7' },
  { icon: '🔧', label: 'Problem Solving', count: 18, bg: '#FEE2E2' },
];

const TODAY_Q = 'Explain the difference between let, var, and const in JavaScript.';

const STATUS_COLORS = { completed: '#10B981', in_progress: '#F59E0B' };
const STATUS_LABELS = { completed: 'Completed', in_progress: 'In Progress' };

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
}

export default function PrepScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    const data = await fetchPrepSessions(5);
    setHistory(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

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
        {loading ? (
          <ActivityIndicator color={C.primary} style={{ padding: 20 }} />
        ) : history.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: C.subtext, fontSize: 13, textAlign: 'center' }}>
              No sessions yet. Start a practice session above!
            </Text>
          </View>
        ) : (
          history.map((h, i) => {
            const color = STATUS_COLORS[h.status] || C.subtext;
            return (
              <View key={h.id} style={[styles.histRow, i < history.length - 1 && styles.rowBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.histSession}>{h.category} Session</Text>
                  <Text style={styles.histDate}>{timeAgo(h.created_at)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
                    <Text style={[styles.statusText, { color }]}>{STATUS_LABELS[h.status] || h.status}</Text>
                  </View>
                  {h.score ? <Text style={styles.histScore}>{h.score}</Text> : null}
                </View>
              </View>
            );
          })
        )}
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
  catCard: { width: '47%', borderRadius: 16, padding: 18, ...shadowSm, shadowColor: '#000' },
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
