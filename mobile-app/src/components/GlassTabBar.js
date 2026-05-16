import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useDrawer } from '../context/DrawerContext';

const TABS = [
  { name: 'Home', icon: '⌂', label: 'Home' },
  { name: 'Analyze', icon: '🔍', label: 'Analyze' },
  { name: 'Generate', icon: '✦', label: 'Generate' },
];

function AnimatedTabBtn({ onPress, focused, icon, label }) {
  const { colors: C, isDark } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () => Animated.spring(scale, { toValue: 0.85, useNativeDriver: true, speed: 32 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }).start();

  return (
    <TouchableOpacity onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} activeOpacity={1} style={styles.tabBtn}>
      <Animated.View style={[styles.tabInner, { transform: [{ scale }] }]}>
        {focused && (
          <View style={[styles.aura, {
            backgroundColor: isDark ? 'rgba(139,127,255,0.15)' : 'rgba(108,99,255,0.1)',
            shadowColor: C.primary, shadowOpacity: isDark ? 0.8 : 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 0 },
          }]} />
        )}
        <Text style={[styles.tabIcon, {
          color: focused ? C.primary : C.subtext,
          textShadowColor: focused && isDark ? 'rgba(139,127,255,0.7)' : 'transparent',
          textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8,
        }]}>
          {icon}
        </Text>
        <Text style={[styles.tabLabel, { color: focused ? C.primary : C.subtext, fontWeight: focused ? '800' : '500' }]}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function BurgerTab() {
  const { toggle, isOpen } = useDrawer();
  const { colors: C, isDark } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () => Animated.spring(scale, { toValue: 0.85, useNativeDriver: true, speed: 32 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }).start();

  return (
    <TouchableOpacity onPress={toggle} onPressIn={pressIn} onPressOut={pressOut} activeOpacity={1} style={styles.tabBtn}>
      <Animated.View style={[styles.tabInner, { transform: [{ scale }] }]}>
        {isOpen && (
          <View style={[styles.aura, {
            backgroundColor: isDark ? 'rgba(139,127,255,0.15)' : 'rgba(108,99,255,0.1)',
            shadowColor: C.primary, shadowOpacity: isDark ? 0.8 : 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 0 },
          }]} />
        )}
        <View style={styles.burgerLines}>
          <View style={[styles.line, { backgroundColor: isOpen ? C.primary : C.subtext }]} />
          <View style={[styles.line, styles.lineMid, { backgroundColor: isOpen ? C.primary : C.subtext }]} />
          <View style={[styles.line, { backgroundColor: isOpen ? C.primary : C.subtext }]} />
        </View>
        <Text style={[styles.tabLabel, { color: isOpen ? C.primary : C.subtext, fontWeight: isOpen ? '800' : '500' }]}>Menu</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function GlassTabBar({ state, navigation }) {
  const { isDark, colors: C } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
      <BlurView intensity={isDark ? 60 : 75} tint={isDark ? 'dark' : 'light'} style={[styles.container, { borderTopColor: C.tabBorder }]}>
        <View style={[styles.inner, { backgroundColor: C.tabBar }]}>
          {/* Burger — leftmost */}
          <BurgerTab />
          {/* Tab screens */}
          {state.routes.map((route, index) => {
            const tab = TABS.find((t) => t.name === route.name);
            if (!tab) return null;
            return (
              <AnimatedTabBtn
                key={route.key}
                icon={tab.icon}
                label={tab.label}
                focused={state.index === index}
                onPress={() => navigation.navigate(route.name)}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  container: { borderTopWidth: 1 },
  inner: { flexDirection: 'row', paddingTop: 10, paddingBottom: 6 },
  tabBtn: { flex: 1, alignItems: 'center' },
  tabInner: { alignItems: 'center', gap: 3, paddingVertical: 5, paddingHorizontal: 10, position: 'relative' },
  aura: { position: 'absolute', top: -6, left: -14, right: -14, bottom: -6, borderRadius: 20, elevation: 0 },
  tabIcon: { fontSize: 21, zIndex: 1 },
  tabLabel: { fontSize: 9, zIndex: 1 },
  burgerLines: { width: 22, height: 21, justifyContent: 'center', gap: 4, zIndex: 1 },
  line: { height: 2, borderRadius: 2, width: '100%' },
  lineMid: { width: '70%' },
});
