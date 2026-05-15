import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { C, shadowSm } from '../theme';

const ACCOUNT_ITEMS = [
  { icon: '👤', label: 'Personal Information', bg: '#EEF0FF' },
  { icon: '✉️', label: 'Email Preferences', bg: '#ECFDF5' },
  { icon: '🔔', label: 'Notifications', bg: '#FEF3C7' },
  { icon: '🔒', label: 'Privacy & Security', bg: '#FEE2E2' },
];

const SUPPORT_ITEMS = [
  { icon: '❓', label: 'Help Center', bg: '#EEF0FF' },
  { icon: '⚙️', label: 'App Settings', bg: '#F3F4F6' },
];

function MenuGroup({ title, items }) {
  return (
    <>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.card}>
        {items.map((item, i) => (
          <TouchableOpacity key={i} style={[styles.menuRow, i < items.length - 1 && styles.rowBorder]}>
            <View style={[styles.menuIcon, { backgroundColor: item.bg }]}>
              <Text style={{ fontSize: 18 }}>{item.icon}</Text>
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Settings</Text>

      <MenuGroup title="Account Settings" items={ACCOUNT_ITEMS} />
      <MenuGroup title="Support" items={SUPPORT_ITEMS} />

      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutText}>🚪  Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>CareerAgent v2.0 · Powered by Gemini AI</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 50 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 24 },
  groupTitle: { fontSize: 13, fontWeight: '600', color: C.subtext, marginBottom: 8, marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', marginBottom: 20, ...shadowSm, shadowColor: '#000' },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  menuIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, color: C.text, fontSize: 15, fontWeight: '500' },
  chevron: { color: C.subtext, fontSize: 22, fontWeight: '300' },
  logoutBtn: { backgroundColor: '#FEE2E2', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 32 },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
  version: { color: C.subtext, fontSize: 12, textAlign: 'center' },
});
