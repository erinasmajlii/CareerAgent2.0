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

const MENU_ITEMS = [
  { icon: '◉',  label: 'Profile',         nav: 'Profile'  },
  { icon: '📚', label: 'Interview Prep',   nav: 'Prep'     },
  { icon: '🤖', label: 'CareerAgent Bot',  nav: 'ChatBot'  },
  { icon: '⚙️', label: 'Settings',         nav: 'Settings' },
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

  // overlayOpacity is already an Animated.Interpolation (derived from translateX).
  // We just use it directly — values go 0→1 as drawer opens.
  // Map it to 0→0.55 darkness using a second interpolation on the raw translateX.
  const dimOpacity = translateX.interpolate({
    inputRange: [-DRAWER_WIDTH, 0],
    outputRange: [0, 0.62],
    extrapolate: 'clamp',
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* ── Dimmed + Blurred Overlay ── */}
      <TouchableWithoutFeedback onPress={close}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: isDark ? '#000' : '#1A1233', opacity: dimOpacity },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* ── Drawer Panel ── */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_WIDTH,
            backgroundColor: isDark ? 'rgba(8,8,18,0.98)' : 'rgba(255,255,255,0.98)',
            borderRightColor: isDark ? 'rgba(139,127,255,0.25)' : 'rgba(108,99,255,0.1)',
            transform: [{ translateX }],
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 20,
            shadowColor: '#8B7FFF',
            shadowOffset: { width: 8, height: 0 },
            shadowOpacity: isDark ? 0.5 : 0.18,
            shadowRadius: 24,
            elevation: 30,
          },
        ]}
      >
        {/* Right-edge purple glow line */}
        {isDark && (
          <LinearGradient
            colors={['transparent', 'rgba(139,127,255,0.45)', 'transparent']}
            style={styles.glowLine}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          />
        )}

        {/* ── Profile Header ── */}
        <LinearGradient
          colors={isDark ? ['rgba(139,127,255,0.14)', 'rgba(10,10,20,0)'] : ['rgba(108,99,255,0.1)', 'rgba(108,99,255,0)']}
          style={styles.drawerHeader}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={[
            styles.avatar,
            {
              borderColor: isDark ? 'rgba(139,127,255,0.7)' : C.primary,
              shadowColor: '#8B7FFF',
              shadowOpacity: isDark ? 0.9 : 0.3,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 0 },
            },
          ]}>
            <LinearGradient
              colors={GRAD}
              style={styles.avatarGrad}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarText}>{initial}</Text>
            </LinearGradient>
          </View>
          <Text style={[styles.drawerName, { color: C.text }]} numberOfLines={1}>{displayName}</Text>
          <Text style={[styles.drawerSub, { color: C.subtext }]} numberOfLines={1}>{targetTitle}</Text>

          {/* Edit Profile pill */}
          <TouchableOpacity
            onPress={() => go('Profile')}
            style={[styles.editPill, { backgroundColor: isDark ? 'rgba(139,127,255,0.15)' : C.primaryLight, borderColor: isDark ? 'rgba(139,127,255,0.35)' : C.primary + '40' }]}
          >
            <Text style={[styles.editPillText, { color: C.primary }]}>✏️  Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Divider ── */}
        <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(139,127,255,0.1)' : 'rgba(0,0,0,0.06)' }]} />

        {/* ── Menu Items ── */}
        <View style={{ flex: 1, paddingTop: 8 }}>
          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.nav}
              style={[
                styles.menuItem,
                { borderBottomColor: isDark ? 'rgba(139,127,255,0.07)' : 'rgba(0,0,0,0.04)' },
              ]}
              onPress={() => go(item.nav)}
              activeOpacity={0.65}
            >
              <View style={[
                styles.menuIconWrap,
                { backgroundColor: isDark ? 'rgba(139,127,255,0.13)' : C.primaryLight + 'CC' },
              ]}>
                <Text style={{ fontSize: 16 }}>{item.icon}</Text>
              </View>
              <Text style={[styles.menuLabel, { color: C.text }]}>{item.label}</Text>
              <Text style={[styles.chevron, { color: isDark ? 'rgba(139,127,255,0.45)' : C.subtext }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Footer ── */}
        <View style={[styles.footer, { borderTopColor: isDark ? 'rgba(139,127,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
          <View style={[styles.versionBadge, { backgroundColor: isDark ? 'rgba(139,127,255,0.1)' : C.primaryLight }]}>
            <Text style={[styles.versionText, { color: C.primary }]}>✦ CareerAgent v2.0</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute', top: 0, left: 0, bottom: 0,
    borderRightWidth: 1,
  },
  glowLine:     { position: 'absolute', right: 0, top: 0, bottom: 0, width: 1 },
  drawerHeader: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 },
  avatar: {
    width: 62, height: 62, borderRadius: 31,
    marginBottom: 12, borderWidth: 2, elevation: 0,
    overflow: 'hidden',
  },
  avatarGrad:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { fontSize: 26, fontWeight: '900', color: '#fff' },
  drawerName:   { fontSize: 15, fontWeight: '800', marginBottom: 3 },
  drawerSub:    { fontSize: 12, marginBottom: 14 },
  editPill: {
    alignSelf: 'flex-start',
    borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  editPillText: { fontSize: 12, fontWeight: '700' },
  divider:      { height: 1, marginHorizontal: 16, marginBottom: 4 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 18, paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuIconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuLabel:    { flex: 1, fontSize: 15, fontWeight: '600', letterSpacing: 0.1 },
  chevron:      { fontSize: 22, marginRight: -2 },
  footer: {
    paddingTop: 14, paddingHorizontal: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  versionBadge: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7 },
  versionText:  { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
});
