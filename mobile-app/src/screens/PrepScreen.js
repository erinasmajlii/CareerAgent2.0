import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { fetchPrepSessions } from '../api';

const CATEGORIES = [
  { icon: '💻', label: 'Technical',      count: 45, col: '#8B7FFF' },
  { icon: '🏗',  label: 'System Design',  count: 20, col: '#10B981' },
  { icon: '🧠', label: 'Behavioral',     count: 30, col: '#F59E0B' },
  { icon: '🔧', label: 'Problem Solving', count: 18, col: '#EF4444' },
];

const TODAY_Q   = 'Explain the difference between let, var, and const in JavaScript.';
const STATUS_C  = { completed: '#10B981', in_progress: '#F59E0B' };
const STATUS_L  = { completed: 'Completed', in_progress: 'In Progress' };

function timeSince(d) {
  if (!d) return '';
  const days = Math.floor((Date.now() - new Date(d)) / 86400000);
  return days === 0 ? 'Today' : days === 1 ? '1 day ago' : `${days} days ago`;
}

export default function PrepScreen({ navigation }) {
  const { colors: C, gradient: GRAD, isDark, shadowSm } = useTheme();
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchPrepSessions(5);
    setHistory(data); setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const glass = (accentColor) => [
    styles.glassCard,
    isDark
      ? { backgroundColor: accentColor ? accentColor + '12' : 'rgba(139,127,255,0.06)', borderColor: accentColor ? accentColor + '35' : 'rgba(139,127,255,0.22)', borderWidth: 1 }
      : { backgroundColor: '#fff', ...shadowSm },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: 110 }]} showsVerticalScrollIndicator={false}>

      <Text style={[styles.pageTitle, { color: C.text }]}>Interview Prep</Text>
      <Text style={[styles.pageSub, { color: C.subtext }]}>AI-generated practice questions, tailored for you</Text>

      {/* ── Categories Grid ── */}
      <Text style={[styles.sectionTitle, { color: C.text }]}>Question Categories</Text>
      <View style={styles.grid}>
        {CATEGORIES.map((cat, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => navigation.navigate('Question', { category: cat.label })}
            activeOpacity={0.8}
            style={[
              styles.catCard,
              isDark
                ? { backgroundColor: cat.col + '14', borderColor: cat.col + '40', borderWidth: 1, shadowColor: cat.col, shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 0 }
                : { backgroundColor: cat.col + '10', ...shadowSm },
            ]}
          >
            <Text style={styles.catIcon}>{cat.icon}</Text>
            <Text style={[styles.catLabel, { color: C.text }]}>{cat.label}</Text>
            <Text style={[styles.catCount, { color: cat.col }]}>{cat.count} Qs</Text>
            <View style={[styles.startBtn, { backgroundColor: cat.col + '22', borderColor: cat.col + '55', borderWidth: 1 }]}>
              <Text style={{ color: cat.col, fontSize: 12, fontWeight: '700' }}>Start →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Today's Challenge ── */}
      <Text style={[styles.sectionTitle, { color: C.text }]}>Today's Challenge</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('Question', { category: 'Technical' })}
        activeOpacity={0.85}
        style={[styles.todayCard, { overflow: 'hidden' }]}
      >
        <LinearGradient colors={GRAD} style={styles.todayGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          {isDark && (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
          )}
          <View style={styles.todayBadge}>
            <Text style={styles.todayBadgeText}>🔥 Technical · Easy</Text>
          </View>
          <Text style={styles.todayQ}>{TODAY_Q}</Text>
          <View style={styles.todayFooter}>
            <Text style={styles.todayAction}>Practice Now →</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* ── Practice History ── */}
      <Text style={[styles.sectionTitle, { color: C.text }]}>Practice History</Text>
      <View style={[...glass(), { overflow: 'hidden', gap: 0 }]}>
        {loading ? (
          <ActivityIndicator color={C.primary} style={{ padding: 20 }} />
        ) : history.length === 0 ? (
          <View style={{ padding: 28, alignItems: 'center' }}>
            <Text style={{ fontSize: 30, marginBottom: 8 }}>📚</Text>
            <Text style={{ color: C.subtext, fontSize: 13, textAlign: 'center' }}>
              No sessions yet.{'\n'}Pick a category above!
            </Text>
          </View>
        ) : (
          history.map((h, i) => {
            const color = STATUS_C[h.status] || C.subtext;
            return (
              <View key={h.id} style={[styles.histRow, i < history.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}>
                <View style={[styles.histIcon, { backgroundColor: color + '22', shadowColor: isDark ? color : 'transparent', shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 0 }]}>
                  <Text style={{ fontSize: 18 }}>🎯</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.histTitle, { color: C.text }]}>{h.category || 'Practice'} Session</Text>
                  <Text style={[styles.histDate, { color: C.subtext }]}>{timeSince(h.created_at)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: color + '22' }]}>
                  <Text style={[styles.statusText, { color }]}>{STATUS_L[h.status] || h.status}</Text>
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
  content:       { paddingHorizontal: 18 },
  pageTitle:     { fontSize: 24, fontWeight: '800', marginBottom: 5, letterSpacing: -0.5 },
  pageSub:       { fontSize: 13, marginBottom: 22, lineHeight: 19 },
  sectionTitle:  { fontSize: 17, fontWeight: '800', marginBottom: 12, letterSpacing: -0.2 },
  grid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 26 },
  catCard:       { width: '47%', borderRadius: 20, padding: 18, gap: 6 },
  catIcon:       { fontSize: 30, marginBottom: 4 },
  catLabel:      { fontSize: 14, fontWeight: '800' },
  catCount:      { fontSize: 12, fontWeight: '600' },
  startBtn:      { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', marginTop: 4 },
  todayCard:     { borderRadius: 22, marginBottom: 26, elevation: 0 },
  todayGrad:     { padding: 22 },
  todayBadge:    { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 14 },
  todayBadgeText:{ color: '#fff', fontSize: 12, fontWeight: '700' },
  todayQ:        { color: '#fff', fontSize: 17, fontWeight: '700', lineHeight: 26, marginBottom: 18 },
  todayFooter:   {},
  todayAction:   { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '800' },
  glassCard:     { borderRadius: 20, padding: 14 },
  histRow:       { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  histIcon:      { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', elevation: 0 },
  histTitle:     { fontSize: 14, fontWeight: '700' },
  histDate:      { fontSize: 12, marginTop: 2 },
  statusBadge:   { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText:    { fontSize: 11, fontWeight: '700' },
});
