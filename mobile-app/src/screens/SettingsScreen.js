import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const ACCOUNT_ITEMS = [
  { icon: '👤', label: 'Personal Information', col: '#8B7FFF' },
  { icon: '✉️', label: 'Email Preferences',    col: '#10B981' },
  { icon: '🔔', label: 'Notifications',         col: '#F59E0B' },
  { icon: '🔒', label: 'Privacy & Security',    col: '#EF4444' },
];

const SUPPORT_ITEMS = [
  { icon: '❓', label: 'Help Center',     col: '#8B7FFF' },
  { icon: '📣', label: 'Send Feedback',   col: '#10B981' },
  { icon: '⭐', label: 'Rate the App',    col: '#F59E0B' },
];

export default function SettingsScreen({ navigation }) {
  const { colors: C, gradient: GRAD, isDark, toggleTheme, shadowSm } = useTheme();
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const glass = [
    styles.card,
    isDark
      ? { backgroundColor: 'rgba(139,127,255,0.05)', borderColor: 'rgba(139,127,255,0.22)', borderWidth: 1 }
      : { backgroundColor: '#fff', ...shadowSm },
  ];

  const renderItem = (item, i, arr) => (
    <TouchableOpacity key={i} style={[styles.row, i < arr.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border }]}>
      <View style={[styles.iconBox, { backgroundColor: item.col + '22', shadowColor: isDark ? item.col : 'transparent', shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 0 }]}>
        <Text style={{ fontSize: 18 }}>{item.icon}</Text>
      </View>
      <Text style={[styles.rowLabel, { flex: 1, color: C.text }]}>{item.label}</Text>
      <Text style={{ color: C.subtext, fontSize: 20 }}>›</Text>
    </TouchableOpacity>
  );

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut().catch(() => {}) },
    ]);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: 60 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: C.primaryLight }]}>
          <Text style={{ color: C.primary, fontWeight: '700' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: C.text }]}>Settings</Text>
        <View style={{ width: 64 }} />
      </View>

      {/* Dark Mode Toggle — Premium Card */}
      <Text style={[styles.groupTitle, { color: C.subtext }]}>Appearance</Text>
      <View style={[...glass, { overflow: 'hidden' }]}>
        {isDark ? (
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        ) : null}
        <LinearGradient
          colors={isDark ? ['rgba(139,127,255,0.12)', 'rgba(108,99,255,0.04)'] : ['#F5F4FF', '#FFFFFF']}
          style={styles.darkRow}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        >
          <View style={[styles.iconBox, {
            backgroundColor: isDark ? 'rgba(139,127,255,0.2)' : '#EEF0FF',
            shadowColor: isDark ? '#8B7FFF' : 'transparent', shadowOpacity: 0.7, shadowRadius: 10, shadowOffset: { width: 0, height: 0 }, elevation: 0,
          }]}>
            <Text style={{ fontSize: 20 }}>{isDark ? '🌙' : '☀️'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowLabel, { color: C.text }]}>Dark Mode</Text>
            <Text style={{ fontSize: 12, color: C.subtext, marginTop: 2 }}>
              {isDark ? 'Cyber-Lounge active' : 'Switch to Cyber-Lounge'}
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: C.border, true: 'rgba(139,127,255,0.5)' }}
            thumbColor={isDark ? '#8B7FFF' : '#6C63FF'}
          />
        </LinearGradient>
      </View>

      {/* Account */}
      <Text style={[styles.groupTitle, { color: C.subtext }]}>Account</Text>
      <View style={glass}>{ACCOUNT_ITEMS.map((it, i) => renderItem(it, i, ACCOUNT_ITEMS))}</View>

      {/* Support */}
      <Text style={[styles.groupTitle, { color: C.subtext }]}>Support</Text>
      <View style={glass}>{SUPPORT_ITEMS.map((it, i) => renderItem(it, i, SUPPORT_ITEMS))}</View>

      {/* Sign Out */}
      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: isDark ? 'rgba(239,68,68,0.08)' : '#FEF2F2', borderColor: isDark ? 'rgba(239,68,68,0.3)' : '#FEE2E2', borderWidth: 1 }]}
        onPress={handleSignOut}
      >
        <Text style={[styles.logoutText, { color: C.danger }]}>🚪  Sign Out</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: C.subtext }]}>CareerAgent v2.0 · Cyber-Lounge Edition</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content:    { paddingHorizontal: 20 },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  backBtn:    { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  pageTitle:  { fontSize: 18, fontWeight: '800' },
  groupTitle: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8, marginTop: 4 },
  card:       { borderRadius: 20, overflow: 'hidden', marginBottom: 22 },
  darkRow:    { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  row:        { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  iconBox:    { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center', elevation: 0 },
  rowLabel:   { fontSize: 15, fontWeight: '600' },
  logoutBtn:  { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 20 },
  logoutText: { fontSize: 16, fontWeight: '800' },
  version:    { fontSize: 12, textAlign: 'center' },
});
