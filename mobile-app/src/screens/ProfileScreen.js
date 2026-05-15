import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Keyboard, TouchableWithoutFeedback
} from 'react-native';

const C = { green: '#00FF41', amber: '#FFBF00', bg: '#000', card: '#0D0D0D', border: '#1A1A1A', muted: '#555' };

const BADGES = ['React Native', 'Python', 'Google Cloud', 'FastAPI', 'Machine Learning'];

export default function ProfileScreen() {
  const [name, setName] = useState('Agent 47');
  const [title, setTitle] = useState('Senior Software Engineer');
  const [targetRole, setTargetRole] = useState('Staff Engineer @ FAANG');
  const [editing, setEditing] = useState(false);

  const stats = [
    { label: 'Analyses Run', value: '12' },
    { label: 'Avg Match Score', value: '74%' },
    { label: 'Sessions', value: '8' },
    { label: 'Ghost Chats', value: '23' },
  ];

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name.charAt(0)}</Text>
          </View>
          <View style={styles.profileMeta}>
            {editing
              ? <TextInput style={styles.editInput} value={name} onChangeText={setName} placeholderTextColor="#444" />
              : <Text style={styles.profileName}>{name}</Text>
            }
            {editing
              ? <TextInput style={[styles.editInput, { marginTop: 6 }]} value={title} onChangeText={setTitle} placeholderTextColor="#444" />
              : <Text style={styles.profileTitle}>{title}</Text>
            }
            <TouchableOpacity onPress={() => setEditing(!editing)} style={styles.editBtn}>
              <Text style={styles.editBtnText}>{editing ? '✓ SAVE' : '✎ EDIT'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.targetCard}>
          <Text style={styles.targetLabel}>TARGET ROLE</Text>
          {editing
            ? <TextInput style={styles.editInput} value={targetRole} onChangeText={setTargetRole} placeholderTextColor="#444" />
            : <Text style={styles.targetValue}>{targetRole}</Text>
          }
        </View>

        <Text style={styles.sectionLabel}>PERFORMANCE STATS</Text>
        <View style={styles.statsGrid}>
          {stats.map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>SKILL BADGES</Text>
        <View style={styles.badgesRow}>
          {BADGES.map(b => (
            <View key={b} style={styles.badge}>
              <Text style={styles.badgeText}>{b}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>RECENT ACTIVITY</Text>
        {[
          { action: 'Gap Analysis', company: 'Google SWE L5', score: '81%', time: '2h ago' },
          { action: 'Ghost Interview', company: 'Meta SWE', score: null, time: '1d ago' },
          { action: 'Gap Analysis', company: 'Stripe Backend', score: '68%', time: '3d ago' },
        ].map((item, i) => (
          <View key={i} style={styles.activityRow}>
            <View style={styles.activityDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activityAction}>{item.action} — <Text style={styles.activityCompany}>{item.company}</Text></Text>
              <Text style={styles.activityTime}>{item.time}</Text>
            </View>
            {item.score && <Text style={styles.activityScore}>{item.score}</Text>}
          </View>
        ))}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 50 },
  profileHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderRadius: 8, padding: 20,
    borderWidth: 1, borderColor: C.border, marginBottom: 16, gap: 16,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: C.green, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#000', fontSize: 28, fontWeight: '900' },
  profileMeta: { flex: 1 },
  profileName: { color: '#fff', fontSize: 20, fontWeight: '700' },
  profileTitle: { color: C.muted, fontSize: 13, marginTop: 2 },
  editInput: {
    color: '#fff', borderBottomWidth: 1, borderBottomColor: C.green,
    fontSize: 14, paddingVertical: 4,
  },
  editBtn: { marginTop: 10, alignSelf: 'flex-start', borderWidth: 1, borderColor: C.green, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 2 },
  editBtnText: { color: C.green, fontSize: 11, letterSpacing: 1 },
  targetCard: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.amber,
    padding: 16, borderRadius: 4, marginBottom: 4,
  },
  targetLabel: { color: C.amber, fontSize: 10, letterSpacing: 3, marginBottom: 6 },
  targetValue: { color: '#fff', fontSize: 16, fontWeight: '600' },
  sectionLabel: { color: C.muted, fontSize: 10, letterSpacing: 3, marginTop: 24, marginBottom: 10 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border, borderRadius: 4, padding: 16, alignItems: 'center',
  },
  statValue: { color: C.green, fontSize: 28, fontWeight: '900' },
  statLabel: { color: C.muted, fontSize: 10, marginTop: 4, letterSpacing: 1, textAlign: 'center' },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { borderWidth: 1, borderColor: C.green, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: C.green, fontSize: 12 },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.green },
  activityAction: { color: '#ccc', fontSize: 13 },
  activityCompany: { color: C.amber },
  activityTime: { color: C.muted, fontSize: 11, marginTop: 2 },
  activityScore: { color: C.green, fontSize: 14, fontWeight: '700' },
});
