import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { C, GRAD, shadow, shadowSm } from '../theme';

function CircularGauge({ pct, size = 90, stroke = 9 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.25)" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="#10B981" strokeWidth={stroke} fill="none"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" rotation="-90" origin={`${size / 2},${size / 2}`}
        />
      </Svg>
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>{pct}%</Text>
    </View>
  );
}

const QUICK = [
  { icon: '📄', label: 'Upload Resume', sub: 'Update for ATS', bg: '#EEF0FF', tab: 'Generate' },
  { icon: '🔍', label: 'Analyze Job', sub: 'Get AI insights', bg: '#ECFDF5', tab: 'Analyze' },
  { icon: '✉️', label: 'Cover Letter', sub: 'Generate with AI', bg: '#FFF7ED', tab: null },
  { icon: '🎤', label: 'Interview Prep', sub: 'Practice questions', bg: '#FEF3C7', tab: 'Prep' },
];

const APPS = [
  { role: 'Senior Software Engineer', company: 'Google', status: 'Active', sc: C.success, time: '2 days ago' },
  { role: 'Frontend Developer', company: 'Meta', status: 'Applied', sc: C.warning, time: '5 days ago' },
  { role: 'Staff Engineer', company: 'Stripe', status: 'In Review', sc: '#6C63FF', time: '1 week ago' },
];

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <LinearGradient colors={GRAD} style={styles.headerCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeSub}>Welcome Back 👋</Text>
            <Text style={styles.welcomeName}>Sarah</Text>
            <Text style={styles.welcomeDate}>May 15, 2026</Text>
          </View>
          <View style={styles.gradeWrap}>
            <CircularGauge pct={78} />
            <Text style={styles.gradeLabel}>ATS Grade</Text>
            <View style={styles.gradeDelta}>
              <Text style={styles.gradeDeltaText}>↑ +2.5%</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.grid}>
        {QUICK.map((q, i) => (
          <TouchableOpacity
            key={i} style={[styles.actionCard, { backgroundColor: q.bg }]}
            onPress={() => q.tab && navigation.navigate(q.tab)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>{q.icon}</Text>
            <Text style={styles.actionLabel}>{q.label}</Text>
            <Text style={styles.actionSub}>{q.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Applications */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Recent Applications</Text>
        <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
      </View>
      <View style={styles.card}>
        {APPS.map((a, i) => (
          <View key={i} style={[styles.appRow, i < APPS.length - 1 && styles.appRowBorder]}>
            <View style={[styles.appIcon, { backgroundColor: C.primaryLight }]}>
              <Text style={{ fontSize: 18 }}>🏢</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.appRole}>{a.role}</Text>
              <Text style={styles.appCompany}>{a.company} · {a.time}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: a.sc + '20' }]}>
              <Text style={[styles.statusText, { color: a.sc }]}>{a.status}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Resume Analysis */}
      <Text style={styles.sectionTitle}>Resume Analysis</Text>
      <View style={[styles.card, styles.resumeCard]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.resumeName}>Senior_Developer_Resume.pdf</Text>
          <Text style={styles.resumeSub}>Last updated · 3 days ago</Text>
          <View style={styles.scoreBar}>
            <View style={[styles.scoreBarFill, { width: '78%' }]} />
          </View>
          <Text style={styles.resumeScore}>ATS Score: 78%</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.analyzeLink}>Analyze →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingBottom: 32 },
  headerCard: { margin: 16, borderRadius: 20, padding: 22, ...shadow },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  welcomeSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  welcomeName: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 2 },
  welcomeDate: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 },
  gradeWrap: { alignItems: 'center', gap: 4 },
  gradeLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' },
  gradeDelta: { backgroundColor: 'rgba(16,185,129,0.25)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  gradeDeltaText: { color: '#6EE7B7', fontSize: 11, fontWeight: '700' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 20, marginBottom: 10 },
  sectionTitle: { color: C.text, fontSize: 17, fontWeight: '700', paddingHorizontal: 16, marginTop: 20, marginBottom: 10 },
  seeAll: { color: C.primary, fontSize: 13, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  actionCard: {
    width: '47%', borderRadius: 16, padding: 16, marginHorizontal: 2,
    ...shadowSm, shadowColor: '#000',
  },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: { color: C.text, fontSize: 14, fontWeight: '700', marginBottom: 3 },
  actionSub: { color: C.subtext, fontSize: 12 },
  card: { marginHorizontal: 16, backgroundColor: C.surface, borderRadius: 16, ...shadowSm, shadowColor: '#000' },
  appRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  appRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  appIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  appRole: { color: C.text, fontSize: 13, fontWeight: '600' },
  appCompany: { color: C.subtext, fontSize: 12, marginTop: 2 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  resumeCard: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  resumeName: { color: C.text, fontSize: 13, fontWeight: '600' },
  resumeSub: { color: C.subtext, fontSize: 12, marginTop: 2, marginBottom: 8 },
  scoreBar: { height: 6, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' },
  scoreBarFill: { height: '100%', backgroundColor: C.success, borderRadius: 3 },
  resumeScore: { color: C.success, fontSize: 12, fontWeight: '700', marginTop: 4 },
  analyzeLink: { color: C.primary, fontSize: 13, fontWeight: '700' },
});
