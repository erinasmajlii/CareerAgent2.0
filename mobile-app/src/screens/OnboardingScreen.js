import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1', icon: '✦',
    title: 'AI-Powered Career\nAssistant',
    desc: 'Your personal AI agent that helps you land your dream job with intelligent, data-driven career guidance.',
    gradient: ['#6C63FF', '#A78BFA'],
  },
  {
    id: '2', icon: '◎',
    title: 'Beat ATS Filters',
    desc: 'Get AI-optimized resume suggestions tailored to each job description. Stand out from the crowd.',
    gradient: ['#7C3AED', '#6C63FF'],
  },
  {
    id: '3', icon: '⚡',
    title: 'Interview Ready',
    desc: 'Practice with our AI interviewer and track your progress across Technical, Behavioral, and System Design rounds.',
    gradient: ['#6C63FF', '#A78BFA'],
  },
];

export default function OnboardingScreen({ onDone }) {
  const { isDark, toggleTheme, colors } = useTheme();
  const insets   = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const flatRef  = useRef(null);

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      const next = index + 1;
      flatRef.current?.scrollToIndex({ index: next, animated: true });
      setIndex(next);
    } else {
      onDone();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>

      {/* Top bar — Dark mode toggle + Skip */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <View style={styles.themeRow}>
          <Text style={{ fontSize: 16 }}>{isDark ? '🌙' : '☀️'}</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#E4E2FF', true: '#4C4880' }}
            thumbColor={isDark ? '#8B7FFF' : '#6C63FF'}
            style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
          />
        </View>
        <TouchableOpacity onPress={onDone} style={styles.skipBtn}>
          <Text style={[styles.skipText, { color: colors.subtext }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(idx);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <LinearGradient
              colors={item.gradient}
              style={styles.iconCircle}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <Text style={styles.icon}>{item.icon}</Text>
            </LinearGradient>
            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.desc, { color: colors.subtext }]}>{item.desc}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === index ? colors.primary : colors.border },
              i === index && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Next / Get Started button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 32 }]}>
        <TouchableOpacity onPress={goNext} activeOpacity={0.85} style={{ width: '100%' }}>
          <LinearGradient
            colors={['#6C63FF', '#A78BFA']}
            style={styles.nextBtn}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextText}>
              {index === SLIDES.length - 1 ? 'Get Started →' : 'Next →'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingBottom: 8,
  },
  themeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  skipBtn: { padding: 8 },
  skipText: { fontSize: 15, fontWeight: '500' },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  iconCircle: {
    width: 140, height: 140, borderRadius: 70,
    alignItems: 'center', justifyContent: 'center', marginBottom: 48,
    shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
  },
  icon: { fontSize: 60, color: '#fff' },
  title: {
    fontSize: 30, fontWeight: '800',
    textAlign: 'center', lineHeight: 40, marginBottom: 16, letterSpacing: -0.5,
  },
  desc: {
    fontSize: 16, textAlign: 'center', lineHeight: 26,
  },
  dots: {
    flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24,
  },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 28 },
  footer: { paddingHorizontal: 32 },
  nextBtn: {
    borderRadius: 50, paddingVertical: 16, alignItems: 'center',
    shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  nextText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
});
