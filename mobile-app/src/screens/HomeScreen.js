import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Animated, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { fetchApplications, fetchAnalyses, fetchPrepSessions } from '../api';

const ROBOT_IMG   = require('../../assets/robot_mascot.png');
const TOUR_KEY    = '@careeragent_toured';

// ── Multi-Step Tour Steps ─────────────────────────────────────────────────────
const TOUR_STEPS = [
  {
    icon: '🤖',
    title: "Hi there, I'm CARO!",
    desc: "Your AI Career Co-Pilot. I'm here to help you land your dream job — faster, smarter, and with less guesswork.",
  },
  {
    icon: '⌂',
    title: 'Home Dashboard',
    desc: "Your command center. See your ATS score at a glance, track your application streak, and follow your recent activity.",
  },
  {
    icon: '🔍',
    title: 'Analyze',
    desc: "Paste a job description and upload your resume. I'll give you an AI-powered gap analysis and ATS match score instantly.",
  },
  {
    icon: '✦',
    title: 'Generate',
    desc: "Paste a LinkedIn URL or raw job text and I'll rewrite your resume bullet points to match — powered by Gemini AI.",
  },
  {
    icon: '☰',
    title: 'The Menu',
    desc: "Tap the menu icon to access Interview Prep (practice Q&A), your Profile, the CareerAgent Bot (general AI assistant), and Settings.",
  },
];

// ── Robot Multi-Step Tour Overlay ─────────────────────────────────────────────
function RobotTour({ username, onDone }) {
  const { colors: C, gradient: GRAD, isDark } = useTheme();
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const animateIn = () => {
    fadeAnim.setValue(0); slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => { animateIn(); }, [step]);

  const current = TOUR_STEPS[step];
  const isLast  = step === TOUR_STEPS.length - 1;
  const greeting = step === 0 ? username : null;

  const next = () => {
    if (isLast) { onDone(); return; }
    setStep((s) => s + 1);
  };

  return (
    <View style={[StyleSheet.absoluteFill, styles.tourOverlay]}>
      {/* Heavily dimmed background */}
      <BlurView intensity={isDark ? 50 : 35} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.65)' }]} />

      <View style={styles.tourContent}>
        {/* Robot */}
        <Image source={ROBOT_IMG} style={styles.tourRobot} resizeMode="contain" />

        {/* Step indicator */}
        <View style={styles.dots}>
          {TOUR_STEPS.map((_, i) => (
            <View key={i} style={[
              styles.dot,
              { backgroundColor: i === step ? C.primary : 'rgba(139,127,255,0.3)',
                width: i === step ? 20 : 6, shadowColor: i === step ? C.primary : 'transparent',
                shadowOpacity: 0.8, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } },
            ]} />
          ))}
        </View>

        {/* Speech Bubble */}
        <Animated.View style={[
          styles.bubble,
          { backgroundColor: isDark ? 'rgba(16,14,32,0.95)' : 'rgba(255,255,255,0.96)',
            borderColor: isDark ? 'rgba(139,127,255,0.4)' : C.border,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
          {/* Tail */}
          <View style={[styles.bubbleTail, { borderBottomColor: isDark ? 'rgba(139,127,255,0.4)' : C.border }]} />

          <View style={[styles.stepIconWrap, { backgroundColor: isDark ? 'rgba(139,127,255,0.15)' : C.primaryLight }]}>
            <Text style={{ fontSize: 24 }}>{current.icon}</Text>
          </View>
          <Text style={[styles.bubbleTitle, { color: C.primary }]}>
            {greeting ? `Hey ${greeting}! ` : ''}{current.title}
          </Text>
          <Text style={[styles.bubbleDesc, { color: C.text }]}>{current.desc}</Text>
        </Animated.View>

        {/* Buttons */}
        <View style={styles.tourBtns}>
          <TouchableOpacity onPress={onDone} style={[styles.skipBtn, { borderColor: 'rgba(255,255,255,0.25)' }]}>
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontWeight: '600', fontSize: 14 }}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={next} activeOpacity={0.85} style={{ flex: 1 }}>
            <LinearGradient colors={GRAD} style={styles.nextBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.nextBtnText}>{isLast ? "Let's go! 🚀" : 'Next →'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── Circular ATS Gauge ────────────────────────────────────────────────────────
function ATSGauge({ score }) {
  const { colors: C, isDark } = useTheme();
  const pulse  = useRef(new Animated.Value(1)).current;
  const size = 160, stroke = 13;
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off  = circ - (score / 100) * circ;
  const col  = score >= 70 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: pulse }], alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={size/2} cy={size/2} r={r} stroke={isDark ? 'rgba(139,127,255,0.15)' : C.border} strokeWidth={stroke} fill="none" />
        <Circle cx={size/2} cy={size/2} r={r} stroke={col} strokeWidth={stroke} fill="none"
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" rotation="-90" origin={`${size/2},${size/2}`} />
      </Svg>
      <View style={{ position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 38, fontWeight: '900', letterSpacing: -1, color: C.text }}>{score}<Text style={{ fontSize: 18 }}>%</Text></Text>
        <Text style={{ fontSize: 11, fontWeight: '600', color: C.subtext, marginTop: 2 }}>ATS Grade</Text>
        <View style={{ borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginTop: 5, backgroundColor: col + '22' }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: col }}>{score >= 70 ? '✓ Strong' : '⚠ Improve'}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const STATUS_COLORS = { active:'#10B981', applied:'#F59E0B', in_review:'#8B7FFF', offer:'#10B981', rejected:'#EF4444' };
const STATUS_LABELS = { active:'Active', applied:'Applied', in_review:'In Review', offer:'Offer!', rejected:'Rejected' };

function timeAgo(d) {
  if (!d) return '';
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m/60)}h ago`;
  return `${Math.floor(m/1440)}d ago`;
}

export default function HomeScreen() {
  const { colors: C, gradient: GRAD, isDark, shadowSm } = useTheme();
  const { profile, user } = useAuth();
  const insets = useSafeAreaInsets();

  const [apps, setApps]         = useState([]);
  const [analyses, setAna]      = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showTour, setTour]     = useState(false);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'there';
  const latestScore = analyses[0]?.match_score ?? 0;

  const load = useCallback(async () => {
    setLoading(true);
    const [a, b, c] = await Promise.all([fetchApplications(5), fetchAnalyses(5), fetchPrepSessions(10)]);
    setApps(a); setAna(b); setSessions(c); setLoading(false);
  }, []);

  useEffect(() => {
    load();
    AsyncStorage.getItem(TOUR_KEY).then((v) => { if (v !== 'true') setTour(true); });
  }, [load]);

  const dismissTour = async () => {
    await AsyncStorage.setItem(TOUR_KEY, 'true');
    setTour(false);
  };

  const STATS = [
    { icon: '📄', label: 'Analyses',    value: analyses.length, color: '#8B7FFF' },
    { icon: '📋', label: 'Applications',value: apps.length,     color: '#10B981' },
    { icon: '🔥', label: 'Streak',      value: sessions.length, color: '#F59E0B' },
  ];

  const activity = [
    ...analyses.map((a) => ({ id:`a-${a.id}`, icon:'🔍', title:'Gap Analysis', sub:`${a.match_score}% match`, time:timeAgo(a.created_at), color:a.match_score>=70?'#10B981':'#F59E0B' })),
    ...apps.map((a) => ({ id:`ap-${a.id}`, icon:'🏢', title:a.role, sub:a.company, time:timeAgo(a.applied_at), color:STATUS_COLORS[a.status]||C.subtext, badge:STATUS_LABELS[a.status] })),
  ].slice(0, 5);

  const glass = (extra = {}) => ([
    {
      borderRadius: 20, padding: 16,
      ...(isDark
        ? { backgroundColor: 'rgba(139,127,255,0.06)', borderWidth: 1, borderColor: 'rgba(139,127,255,0.22)' }
        : { backgroundColor: '#fff', ...shadowSm }),
      ...extra,
    },
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={[{ paddingHorizontal: 18, paddingBottom: 110 }, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Branded Top Section ─────────────────────────────────────────── */}
        <View style={styles.brandedHeader}>
          <LinearGradient colors={GRAD} style={styles.brandLogoBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={{ fontSize: 20, color: '#fff', fontWeight: '900' }}>✦</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={[styles.brandName, { color: C.primary }]}>CareerAgent</Text>
            <Text style={[styles.brandTagline, { color: C.subtext }]}>Your AI Career Co-Pilot</Text>
          </View>
          <View style={[styles.gradeChip, { backgroundColor: isDark ? 'rgba(139,127,255,0.15)' : C.primaryLight, borderColor: isDark ? 'rgba(139,127,255,0.35)' : C.border, borderWidth: 1 }]}>
            <Text style={[styles.gradeChipText, { color: C.primary }]}>v2.0</Text>
          </View>
        </View>

        <Text style={[styles.greeting, { color: C.subtext }]}>Good to see you 👋</Text>
        <Text style={[styles.name, { color: C.text }]}>{displayName}</Text>

        {/* ── Quick Stats ─────────────────────────────────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 20 }}>
          {STATS.map((s, i) => (
            <View key={i} style={{
              width: 115, borderRadius: 18, padding: 14, alignItems: 'center', gap: 4,
              ...(isDark
                ? { backgroundColor: s.color + '14', borderColor: s.color + '40', borderWidth: 1, shadowColor: s.color, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 0 }, elevation: 0 }
                : { backgroundColor: s.color + '11', ...shadowSm }),
            }}>
              <Text style={{ fontSize: 24, marginBottom: 2 }}>{s.icon}</Text>
              <Text style={{ fontSize: 24, fontWeight: '900', color: s.color }}>{s.value}</Text>
              <Text style={{ fontSize: 10, fontWeight: '600', color: C.subtext, textAlign: 'center' }}>{s.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ── ATS Gauge ───────────────────────────────────────────────────── */}
        <View style={[...glass({ alignItems: 'center', paddingVertical: 24, marginBottom: 20 })]}>
          <ATSGauge score={latestScore} />
        </View>

        {/* ── Recent Activity ─────────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: C.text }]}>Recent Activity</Text>
        {loading ? (
          <ActivityIndicator color={C.primary} style={{ marginTop: 20 }} />
        ) : activity.length === 0 ? (
          <View style={[...glass({ alignItems: 'center', paddingVertical: 32 })]}>
            <Text style={{ fontSize: 36, marginBottom: 10 }}>📭</Text>
            <Text style={{ color: C.subtext, fontSize: 13, textAlign: 'center' }}>No activity yet.{'\n'}Start by analyzing a job!</Text>
          </View>
        ) : (
          activity.map((item) => (
            <View key={item.id} style={[...glass({ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 })]}>
              <View style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: item.color + '22' }}>
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.text }}>{item.title}</Text>
                <Text style={{ fontSize: 12, color: C.subtext, marginTop: 2 }}>{item.sub}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={{ fontSize: 11, color: C.subtext }}>{item.time}</Text>
                {item.badge && (
                  <View style={{ borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: item.color + '22' }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: item.color }}>{item.badge}</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* ── Robot Tour Overlay ──────────────────────────────────────────── */}
      {showTour && <RobotTour username={displayName} onDone={dismissTour} />}
    </View>
  );
}

const styles = StyleSheet.create({
  // Branded header
  brandedHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  brandLogoBox:  { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: '#8B7FFF', shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: 0 }, elevation: 0 },
  brandName:     { fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  brandTagline:  { fontSize: 11, fontWeight: '500', marginTop: 1 },
  gradeChip:     { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  gradeChipText: { fontSize: 11, fontWeight: '800' },
  greeting:      { fontSize: 13, fontWeight: '500', marginBottom: 3 },
  name:          { fontSize: 24, fontWeight: '900', marginBottom: 18, letterSpacing: -0.5 },
  sectionTitle:  { fontSize: 17, fontWeight: '800', marginBottom: 12, letterSpacing: -0.2 },
  // Robot Tour
  tourOverlay:   { zIndex: 200, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 60 },
  tourContent:   { alignItems: 'center', paddingHorizontal: 22, width: '100%', gap: 14 },
  tourRobot:     { width: 180, height: 180 },
  dots:          { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot:           { height: 6, borderRadius: 3, elevation: 0 },
  bubble: {
    borderWidth: 1, borderRadius: 22, padding: 20, width: '100%',
    position: 'relative', gap: 10,
    shadowColor: '#8B7FFF', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 0 }, elevation: 0,
  },
  bubbleTail:    { position: 'absolute', top: -11, left: '46%', width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10, borderBottomWidth: 11, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  stepIconWrap:  { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  bubbleTitle:   { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  bubbleDesc:    { fontSize: 14, lineHeight: 22 },
  tourBtns:      { flexDirection: 'row', gap: 12, width: '100%' },
  skipBtn:       { borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center', borderWidth: 1 },
  nextBtn:       { borderRadius: 16, paddingVertical: 16, alignItems: 'center', shadowColor: '#8B7FFF', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  nextBtnText:   { color: '#fff', fontSize: 16, fontWeight: '800' },
});
