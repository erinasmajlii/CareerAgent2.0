import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, GRAD, shadow, shadowSm } from '../theme';

const STATS = [
  { value: '12', label: 'Saved\nResumes' },
  { value: '24', label: 'Applications\nTracked' },
  { value: '143', label: 'Practice\nSessions' },
];

const MY_CONTENT = [
  { icon: '📄', label: 'Saved Resumes', count: '3 documents' },
  { icon: '📋', label: 'Applications', count: '24 tracking' },
];

export default function ProfileScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <LinearGradient colors={GRAD} style={styles.headerCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>S</Text>
        </View>
        <Text style={styles.userName}>Sarah Johnson</Text>
        <Text style={styles.userEmail}>sarah@example.com</Text>
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats Row */}
      <View style={styles.statsCard}>
        {STATS.map((s, i) => (
          <React.Fragment key={i}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
            {i < STATS.length - 1 && <View style={styles.statDivider} />}
          </React.Fragment>
        ))}
      </View>

      {/* My Content */}
      <Text style={styles.sectionTitle}>My Content</Text>
      <View style={styles.card}>
        {MY_CONTENT.map((item, i) => (
          <TouchableOpacity key={i} style={[styles.menuRow, i < MY_CONTENT.length - 1 && styles.rowBorder]}>
            <View style={styles.menuIcon}>
              <Text style={{ fontSize: 20 }}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuCount}>{item.count}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Account Settings */}
      <Text style={styles.sectionTitle}>Account Settings</Text>
      <View style={styles.card}>
        <TouchableOpacity style={[styles.menuRow, styles.rowBorder]} onPress={() => navigation.navigate('Settings')}>
          <View style={[styles.menuIcon, { backgroundColor: '#EEF0FF' }]}>
            <Text style={{ fontSize: 20 }}>⚙️</Text>
          </View>
          <Text style={[styles.menuLabel, { flex: 1 }]}>App Settings</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuRow}>
          <View style={[styles.menuIcon, { backgroundColor: '#FEE2E2' }]}>
            <Text style={{ fontSize: 20 }}>🔒</Text>
          </View>
          <Text style={[styles.menuLabel, { flex: 1 }]}>Privacy & Security</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingBottom: 40 },
  headerCard: { alignItems: 'center', padding: 32, paddingTop: 40 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    borderWidth: 3, borderColor: '#fff',
  },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: '900' },
  userName: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  userEmail: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 16 },
  editBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 24, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  editText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  statsCard: {
    flexDirection: 'row', backgroundColor: C.surface, marginHorizontal: 16, borderRadius: 18,
    paddingVertical: 20, marginTop: -20, ...shadow, marginBottom: 24,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: C.primary, fontSize: 24, fontWeight: '900' },
  statLabel: { color: C.subtext, fontSize: 11, textAlign: 'center', marginTop: 4, lineHeight: 16 },
  statDivider: { width: 1, backgroundColor: C.border, marginVertical: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: C.text, marginBottom: 10, paddingHorizontal: 16 },
  card: { backgroundColor: C.surface, borderRadius: 16, marginHorizontal: 16, marginBottom: 20, overflow: 'hidden', ...shadowSm, shadowColor: '#000' },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  menuIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { color: C.text, fontSize: 15, fontWeight: '600' },
  menuCount: { color: C.subtext, fontSize: 12, marginTop: 2 },
  chevron: { color: C.subtext, fontSize: 22, fontWeight: '300' },
  logoutBtn: { marginHorizontal: 16, paddingVertical: 16, alignItems: 'center', backgroundColor: '#FEE2E2', borderRadius: 14 },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});
