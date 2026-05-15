import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, GRAD } from '../theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1', icon: '✦',
    title: 'AI-Powered Career\nAssistant',
    desc: 'Your personal AI agent that helps you land your dream job with intelligent career guidance.',
  },
  {
    id: '2', icon: '◎',
    title: 'ATS Optimization',
    desc: 'Beat applicant tracking systems with AI-optimized resumes and get automated filters.',
  },
  {
    id: '3', icon: '⚡',
    title: 'Smart Job\nMatching',
    desc: 'Analyze job descriptions and get personalized recommendations to improve your application.',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef(null);

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      flatRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    } else {
      navigation.replace('Login');
    }
  };

  const skip = () => navigation.replace('Login');

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <LinearGradient colors={GRAD} style={styles.iconCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.icon}>{item.icon}</Text>
            </LinearGradient>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.btns}>
        <TouchableOpacity onPress={skip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goNext} activeOpacity={0.85}>
          <LinearGradient colors={GRAD} style={styles.nextBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.nextText}>
              {currentIndex === SLIDES.length - 1 ? 'Get Started →' : 'Next →'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
    paddingBottom: 20,
  },
  iconCircle: {
    width: 130, height: 130, borderRadius: 65,
    alignItems: 'center', justifyContent: 'center', marginBottom: 48,
  },
  icon: { fontSize: 56, color: '#fff' },
  title: {
    fontSize: 30, fontWeight: '800', color: C.text,
    textAlign: 'center', lineHeight: 40, marginBottom: 16,
  },
  desc: { fontSize: 16, color: C.subtext, textAlign: 'center', lineHeight: 26 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.border },
  dotActive: { backgroundColor: C.primary, width: 28, borderRadius: 4 },
  btns: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 32, paddingBottom: 52,
  },
  skipBtn: { padding: 12 },
  skipText: { color: C.subtext, fontSize: 16, fontWeight: '500' },
  nextBtn: { paddingHorizontal: 36, paddingVertical: 14, borderRadius: 50 },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
