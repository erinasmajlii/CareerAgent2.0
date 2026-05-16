import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

export default function EditProfileScreen({ navigation }) {
  const { colors: C, gradient: GRAD, isDark, shadowSm } = useTheme();
  const { profile, user } = useAuth();
  const insets = useSafeAreaInsets();

  const [fullName,     setFullName]     = useState(profile?.full_name     || '');
  const [email,        setEmail]        = useState(user?.email             || '');
  const [targetTitle,  setTargetTitle]  = useState(profile?.target_title  || '');
  const [loading,      setLoading]      = useState(false);
  const [shimmer,      setShimmer]      = useState(false);

  const initial = (fullName || user?.email || '?').charAt(0).toUpperCase();

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, full_name: fullName.trim(), target_title: targetTitle.trim() });
      if (error) throw error;
      Alert.alert('✓ Saved', 'Your profile has been updated.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not save profile.');
    } finally { setLoading(false); }
  };

  const glassBorder = isDark
    ? { backgroundColor: 'rgba(139,127,255,0.06)', borderColor: 'rgba(139,127,255,0.25)', borderWidth: 1 }
    : { backgroundColor: '#fff', ...shadowSm };

  const S = getStyles(C);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={[S.content, { paddingTop: insets.top + 24, paddingBottom: 60 }]} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={S.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[S.backBtn, { backgroundColor: C.primaryLight }]}>
            <Text style={{ color: C.primary, fontWeight: '700' }}>← Back</Text>
          </TouchableOpacity>
          <Text style={[S.pageTitle, { color: C.text }]}>Edit Profile</Text>
          <View style={{ width: 64 }} />
        </View>

        {/* Avatar */}
        <View style={S.avatarSection}>
          <View style={[S.avatarRing, { borderColor: C.primary, shadowColor: C.primary }]}>
            <LinearGradient colors={GRAD} style={S.avatarGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={S.avatarInitial}>{initial}</Text>
            </LinearGradient>
          </View>
          <TouchableOpacity style={[S.changePhotoBtn, { backgroundColor: C.primaryLight }]}>
            <Text style={{ color: C.primary, fontSize: 13, fontWeight: '700' }}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Fields */}
        <View style={[S.formCard, glassBorder]}>
          <View style={[S.fieldGroup, { borderBottomColor: C.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
            <Text style={[S.fieldLabel, { color: C.subtext }]}>FULL NAME</Text>
            <TextInput
              value={fullName} onChangeText={setFullName}
              style={[S.fieldInput, { color: C.text }]}
              placeholder="Sarah Johnson"
              placeholderTextColor={C.border}
              autoCapitalize="words"
            />
          </View>
          <View style={[S.fieldGroup, { borderBottomColor: C.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
            <Text style={[S.fieldLabel, { color: C.subtext }]}>EMAIL</Text>
            <TextInput
              value={email}
              editable={false}
              style={[S.fieldInput, { color: C.subtext }]}
              placeholder="you@example.com"
              placeholderTextColor={C.border}
            />
          </View>
          <View style={S.fieldGroup}>
            <Text style={[S.fieldLabel, { color: C.subtext }]}>TARGET JOB TITLE</Text>
            <TextInput
              value={targetTitle} onChangeText={setTargetTitle}
              style={[S.fieldInput, { color: C.text }]}
              placeholder="e.g. Senior Product Manager"
              placeholderTextColor={C.border}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity onPress={handleSave} disabled={loading} activeOpacity={0.85}>
          <LinearGradient
            colors={GRAD}
            style={[S.saveBtn, { opacity: loading ? 0.7 : 1 }]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={S.saveBtnText}>✦  Save Changes</Text>}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={[S.note, { color: C.subtext }]}>Email address cannot be changed here. Contact support to update it.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (C) => StyleSheet.create({
  content:        { paddingHorizontal: 20 },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  backBtn:        { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  pageTitle:      { fontSize: 18, fontWeight: '800' },
  avatarSection:  { alignItems: 'center', marginBottom: 32, gap: 14 },
  avatarRing: {
    width: 108, height: 108, borderRadius: 54,
    borderWidth: 3,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 18, elevation: 0,
    padding: 3,
  },
  avatarGrad:     { flex: 1, borderRadius: 51, alignItems: 'center', justifyContent: 'center' },
  avatarInitial:  { color: '#fff', fontSize: 44, fontWeight: '900' },
  changePhotoBtn: { borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  formCard:       { borderRadius: 20, marginBottom: 24, overflow: 'hidden' },
  fieldGroup:     { paddingHorizontal: 20, paddingVertical: 16 },
  fieldLabel:     { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 },
  fieldInput:     { fontSize: 16, fontWeight: '600', paddingVertical: 4 },
  saveBtn: {
    borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 16,
    shadowColor: '#8B7FFF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 16, elevation: 8,
  },
  saveBtnText:    { color: '#fff', fontSize: 16, fontWeight: '800' },
  note:           { fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
