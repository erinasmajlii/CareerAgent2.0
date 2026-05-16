import React from 'react';
import {
  View, Text, TouchableOpacity, Animated, StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDrawer, DRAWER_WIDTH } from '../context/DrawerContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// Profile & Prep are TABS → navigate directly by name (RN6 traverses hierarchy)
// ChatBot & Settings are STACK screens → navigate directly by name
const MENU_ITEMS = [
  { icon: '◉',  label: 'Profile',         nav: 'Profile',  isTab: true  },
  { icon: '📚', label: 'Interview Prep',   nav: 'Prep',     isTab: true  },
  { icon: '🤖', label: 'CareerAgent Bot',  nav: 'ChatBot',  isTab: false },
  { icon: '⚙️', label: 'Settings',         nav: 'Settings', isTab: false },
];

export default function SideDrawer() {
  const { isOpen, close, translateX, overlayOpacity } = useDrawer();
  const { colors: C, gradient: GRAD, isDark }          = useTheme();
  const { profile, user }                              = useAuth();
  const navigation                                     = useNavigation();
  const insets                                         = useSafeAreaInsets();

  if (!isOpen) return null;

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const targetTitle = profile?.target_title || 'Career Professional';
  const initial     = displayName.charAt(0).toUpperCase();

  const go = (screen) => {
    close();
    setTimeout(() => navigation.navigate(screen), 160);
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Dimmed overlay */}
      <TouchableWithoutFeedback onPress={close}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]}>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: overlayOpacity.interpolate
            ? overlayOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] })
            : 0.45 }]}
          >
            <BlurView intensity={isDark ? 20 : 10} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          </Animated.View>
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* Drawer Panel */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_WIDTH,
            backgroundColor: isDark ? 'rgba(10,10,20,0.97)' : 'rgba(255,255,255,0.97)',
            borderRightColor: isDark ? 'rgba(139,127,255,0.3)' : 'rgba(108,99,255,0.12)',
            transform: [{ translateX }],
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 16,
            shadowColor: '#8B7FFF',
            shadowOffset: { width: 6, height: 0 },
            shadowOpacity: isDark ? 0.4 : 0.15,
            shadowRadius: 20,
          },
        ]}
      >
        {/* Glow accent line */}
        {isDark && (
          <LinearGradient
            colors={['transparent', 'rgba(139,127,255,0.5)', 'transparent']}
            style={styles.glowLine}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          />
        )}

        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#13121F', '#0A0A14'] : GRAD}
          style={styles.drawerHeader}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={[styles.avatar, { borderColor: isDark ? 'rgba(139,127,255,0.6)' : 'rgba(255,255,255,0.5)', shadowColor: '#8B7FFF', shadowOpacity: isDark ? 0.8 : 0, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } }]}>
            <Text style={[styles.avatarText, { color: isDark ? C.primary : '#fff' }]}>{initial}</Text>
          </View>
          <Text style={[styles.drawerName, { color: isDark ? C.text : '#fff' }]} numberOfLines={1}>{displayName}</Text>
          <Text style={[styles.drawerSub, { color: isDark ? C.subtext : 'rgba(255,255,255,0.7)' }]} numberOfLines={1}>{targetTitle}</Text>
        </LinearGradient>

        {/* Menu */}
        <View style={{ flex: 1, paddingTop: 12 }}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.nav}
              style={[
                styles.menuItem,
                { borderBottomColor: isDark ? 'rgba(139,127,255,0.08)' : 'rgba(0,0,0,0.05)' },
              ]}
              onPress={() => go(item.nav)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: isDark ? 'rgba(139,127,255,0.12)' : C.primaryLight }]}>
                <Text style={{ fontSize: 15 }}>{item.icon}</Text>
              </View>
              <Text style={[styles.menuLabel, { color: C.text }]}>{item.label}</Text>
              <Text style={[styles.chevron, { color: isDark ? 'rgba(139,127,255,0.5)' : C.subtext }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity><Text style={[styles.footerText, { color: C.subtext }]}>Terms</Text></TouchableOpacity>
          <Text style={[styles.footerDot, { color: C.border }]}>·</Text>
          <TouchableOpacity><Text style={[styles.footerText, { color: C.subtext }]}>Privacy</Text></TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute', top: 0, left: 0, bottom: 0,
    borderRightWidth: 1, elevation: 25,
  },
  glowLine:    { position: 'absolute', right: 0, top: 0, bottom: 0, width: 1 },
  drawerHeader:{ padding: 20, paddingBottom: 22 },
  avatar: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: 'rgba(139,127,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10, borderWidth: 2, elevation: 0,
  },
  avatarText:   { fontSize: 24, fontWeight: '900' },
  drawerName:   { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  drawerSub:    { fontSize: 11 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel:    { flex: 1, fontSize: 14, fontWeight: '600' },
  chevron:      { fontSize: 20 },
  footer:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 12, paddingHorizontal: 12 },
  footerText:   { fontSize: 10 },
  footerDot:    { fontSize: 10 },
});
