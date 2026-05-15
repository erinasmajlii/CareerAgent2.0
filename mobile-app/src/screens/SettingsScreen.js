import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, Keyboard, TouchableWithoutFeedback
} from 'react-native';

const C = { green: '#00FF41', amber: '#FFBF00', bg: '#000', card: '#0D0D0D', border: '#1A1A1A', muted: '#555' };

export default function SettingsScreen() {
  const [googleSearch, setGoogleSearch] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [mockMode, setMockMode] = useState(false);
  const [theme, setTheme] = useState('matrix'); // matrix | amber
  const [analysisDepth, setAnalysisDepth] = useState('standard'); // standard | deep

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageLabel}>[ CONTROL PANEL ]</Text>
          <Text style={styles.pageTitle}>Settings</Text>
        </View>

        <SectionHeader title="ANALYSIS PREFERENCES" />

        <SettingRow label="Google Search Grounding" description="Use live web results in Gemini analysis">
          <Switch
            value={googleSearch}
            onValueChange={setGoogleSearch}
            trackColor={{ false: '#222', true: C.green }}
            thumbColor={googleSearch ? '#000' : '#555'}
          />
        </SettingRow>

        <SettingRow label="Analysis Depth" description="Controls how deeply Gemini analyzes the JD">
          <View style={styles.segmentRow}>
            {['standard', 'deep'].map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.segment, analysisDepth === opt && styles.segmentActive]}
                onPress={() => setAnalysisDepth(opt)}
              >
                <Text style={[styles.segmentText, analysisDepth === opt && styles.segmentTextActive]}>
                  {opt.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SettingRow>

        <SettingRow label="Mock Mode" description="Returns sample data without hitting the API">
          <Switch
            value={mockMode}
            onValueChange={setMockMode}
            trackColor={{ false: '#222', true: C.amber }}
            thumbColor={mockMode ? '#000' : '#555'}
          />
        </SettingRow>

        <SectionHeader title="APP EXPERIENCE" />

        <SettingRow label="Haptic Feedback" description="Vibrate on key interactions">
          <Switch
            value={haptics}
            onValueChange={setHaptics}
            trackColor={{ false: '#222', true: C.green }}
            thumbColor={haptics ? '#000' : '#555'}
          />
        </SettingRow>

        <SettingRow label="Accent Theme" description="Choose your terminal color scheme">
          <View style={styles.segmentRow}>
            {[{ key: 'matrix', color: C.green }, { key: 'amber', color: C.amber }].map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.segment, theme === opt.key && { ...styles.segmentActive, borderColor: opt.color, backgroundColor: opt.color + '20' }]}
                onPress={() => setTheme(opt.key)}
              >
                <Text style={[styles.segmentText, theme === opt.key && { color: opt.color }]}>
                  {opt.key.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SettingRow>

        <SectionHeader title="BACKEND" />
        <View style={styles.infoCard}>
          <Text style={styles.infoRow}><Text style={styles.infoKey}>Host  </Text><Text style={styles.infoVal}>172.20.10.3:8000</Text></Text>
          <Text style={styles.infoRow}><Text style={styles.infoKey}>Model </Text><Text style={styles.infoVal}>gemini-2.5-pro</Text></Text>
          <Text style={styles.infoRow}><Text style={styles.infoKey}>Status</Text><Text style={[styles.infoVal, { color: C.green }]}>  CONNECTED</Text></Text>
        </View>

        <Text style={styles.version}>CareerAgent v1.0.0 — Hackathon Edition</Text>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

function SectionHeader({ title }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function SettingRow({ label, description, children }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDesc}>{description}</Text>
      </View>
      <View style={styles.settingControl}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 50 },
  pageHeader: { marginBottom: 28, borderLeftWidth: 3, borderLeftColor: C.amber, paddingLeft: 14 },
  pageLabel: { color: C.amber, fontSize: 10, letterSpacing: 3, marginBottom: 4, opacity: 0.7 },
  pageTitle: { color: '#fff', fontSize: 30, fontWeight: '900', letterSpacing: 1 },
  sectionHeader: { color: C.muted, fontSize: 10, letterSpacing: 3, marginTop: 24, marginBottom: 8 },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    padding: 16, borderRadius: 4, marginBottom: 8,
  },
  settingInfo: { flex: 1, marginRight: 12 },
  settingLabel: { color: '#ddd', fontSize: 14, fontWeight: '600' },
  settingDesc: { color: C.muted, fontSize: 11, marginTop: 3 },
  settingControl: { alignItems: 'flex-end' },
  segmentRow: { flexDirection: 'row', gap: 6 },
  segment: { paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.border, borderRadius: 2 },
  segmentActive: { borderColor: C.green, backgroundColor: 'rgba(0,255,65,0.1)' },
  segmentText: { color: C.muted, fontSize: 11 },
  segmentTextActive: { color: C.green },
  infoCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 4, padding: 16, gap: 8 },
  infoRow: { fontSize: 13 },
  infoKey: { color: C.muted, fontFamily: 'monospace' },
  infoVal: { color: '#ccc', fontFamily: 'monospace' },
  version: { color: C.muted, fontSize: 11, textAlign: 'center', marginTop: 28, letterSpacing: 1 },
});
