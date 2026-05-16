import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { fetchAnalyses, fetchApplications, fetchPrepSessions } from '../api';

const MENU = [
  { icon: '📄', label: 'Saved Analyses',    sub: 'Your gap analysis history',  color: '#8B7FFF' },
  { icon: '📋', label: 'Applications',       sub: 'Track your job pipeline',    color: '#10B981' },
  { icon: '🔔', label: 'Notifications',      sub: 'Alerts & reminders',         color: '#F59E0B' },
  { icon: '🔒', label: 'Privacy & Security', sub: 'Account protection',         color: '#EF4444' },
];

export default function ProfileScreen({ navigation }) {
  const { colors: C, gradient: GRAD, isDark, neonShadow, shadowSm } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, user, signOut } = useAuth();
  const [stats, setStats]   = useState({ analyses: 0, apps: 0, sessions: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [a, b, c] = await Promise.all([fetchAnalyses(100), fetchApplications(100), fetchPrepSessions(100)]);
    setStats({ analyses: a.length, apps: b.length, sessions: c.length });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const targetTitle = profile?.target_title || 'Career Professional';
  const initial     = displayName.charAt(0).toUpperCase();

  const glassCard = [
    styles.card,
    isDark
      ? { backgroundColor: 'rgba(139,127,255,0.06)', borderColor: 'rgba(139,127,255,0.22)', borderWidth: 1 }
      : { backgroundColor: '#fff', ...shadowSm },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>

      {/* ── Profile Header ── */}
      <LinearGradient colors={isDark ? ['#13121F', '#0A0A1A'] : GRAD} style={[styles.headerGrad, { paddingTop: insets.top + 68 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        {/* Avatar with neon glow ring */}
        <View style={[
          styles.avatarRing,
          {
            borderColor: isDark ? '#8B7FFF' : 'rgba(255,255,255,0.7)',
            shadowColor: '#8B7FFF', shadowOffset: { width: 0, height: 0 },
            shadowOpacity: isDark ? 0.9 : 0.4, shadowRadius: 20,
          },
        ]}>
          <LinearGradient colors={GRAD} style={styles.avatarInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.avatarText}>{initial}</Text>
          </LinearGradient>
        </View>
        <Text style={[styles.userName, { color: isDark ? C.text : '#fff' }]}>{displayName}</Text>
        <Text style={[styles.userTitle, { color: isDark ? C.subtext : 'rgba(255,255,255,0.75)' }]}>{targetTitle}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditProfile')}
          style={[styles.editBtn, { backgroundColor: isDark ? 'rgba(139,127,255,0.2)' : 'rgba(255,255,255,0.25)', borderColor: isDark ? 'rgba(139,127,255,0.5)' : 'rgba(255,255,255,0.5)', borderWidth: 1 }]}
        >
          <Text style={{ color: isDark ? C.primary : '#fff', fontWeight: '700', fontSize: 14 }}>✏️  Edit Profile</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* ── Stats Card ── */}
      <View style={[styles.statsCard, isDark ? { backgroundColor: '#13121F', borderColor: 'rgba(139,127,255,0.25)', borderWidth: 1, shadowColor: '#8B7FFF', shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 0, height: 0 } } : { backgroundColor: '#fff', ...shadowSm }]}>
        {loading ? (
          <ActivityIndicator color={C.primary} style={{ flex: 1, paddingVertical: 16 }} />
        ) : (
          [
            { label: 'Analyses',     value: stats.analyses, color: '#8B7FFF' },
            { label: 'Applications', value: stats.apps,     color: '#10B981' },
            { label: 'Sessions',     value: stats.sessions, color: '#F59E0B' },
          ].map((s, i, arr) => (
            <React.Fragment key={i}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: C.subtext }]}>{s.label}</Text>
              </View>
              {i < arr.length - 1 && <View style={[styles.statDivider, { backgroundColor: C.border }]} />}
            </React.Fragment>
          ))
        )}
      </View>

      {/* ── Menu Items ── */}
      <View style={{ paddingHorizontal: 18, gap: 10, marginTop: 8 }}>
        {MENU.map((item, i) => (
          <TouchableOpacity key={i} style={glassCard} activeOpacity={0.75}>
            <View style={[styles.menuIcon, { backgroundColor: item.color + '22', shadowColor: item.color, shadowOpacity: isDark ? 0.5 : 0, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } }]}>
              <Text style={{ fontSize: 20 }}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuLabel, { color: C.text }]}>{item.label}</Text>
              <Text style={[styles.menuSub, { color: C.subtext }]}>{item.sub}</Text>
            </View>
            <Text style={[styles.chevron, { color: C.subtext }]}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Settings & Sign Out ── */}
      <View style={{ paddingHorizontal: 18, marginTop: 16, gap: 10 }}>
        <TouchableOpacity style={glassCard} onPress={() => navigation.navigate('Settings')} activeOpacity={0.75}>
          <View style={[styles.menuIcon, { backgroundColor: 'rgba(139,127,255,0.15)' }]}><Text style={{ fontSize: 20 }}>⚙️</Text></View>
          <Text style={[styles.menuLabel, { flex: 1, color: C.text }]}>Settings</Text>
          <Text style={[styles.chevron, { color: C.subtext }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[glassCard, { borderColor: isDark ? 'rgba(239,68,68,0.3)' : '#FEE2E2', backgroundColor: isDark ? 'rgba(239,68,68,0.06)' : '#FFF5F5' }]}
          onPress={() => signOut().catch(() => {})}
          activeOpacity={0.75}
        >
          <View style={[styles.menuIcon, { backgroundColor: 'rgba(239,68,68,0.15)' }]}><Text style={{ fontSize: 20 }}>🚪</Text></View>
          <Text style={[styles.menuLabel, { flex: 1, color: C.danger }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerGrad:   { alignItems: 'center', paddingBottom: 36, paddingHorizontal: 24 },
  avatarRing:   { width: 100, height: 100, borderRadius: 50, borderWidth: 3, padding: 3, marginBottom: 14, elevation: 0 },
  avatarInner:  { flex: 1, borderRadius: 47, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { color: '#fff', fontSize: 40, fontWeight: '900' },
  userName:     { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  userTitle:    { fontSize: 14, marginBottom: 18 },
  editBtn:      { borderRadius: 24, paddingHorizontal: 24, paddingVertical: 10 },
  statsCard: {
    flexDirection: 'row', marginHorizontal: 18, borderRadius: 20,
    paddingVertical: 20, marginTop: -20, marginBottom: 20,
  },
  statItem:     { flex: 1, alignItems: 'center' },
  statValue:    { fontSize: 26, fontWeight: '900' },
  statLabel:    { fontSize: 11, marginTop: 4 },
  statDivider:  { width: 1, marginVertical: 6 },
  card:         { flexDirection: 'row', alignItems: 'center', borderRadius: 18, padding: 14, gap: 14 },
  menuIcon:     { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', elevation: 0 },
  menuLabel:    { fontSize: 15, fontWeight: '700' },
  menuSub:      { fontSize: 12, marginTop: 2 },
  chevron:      { fontSize: 22 },
});
