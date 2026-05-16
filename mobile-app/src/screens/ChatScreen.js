import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { chatWithInterviewer } from '../api';

export default function ChatScreen({ result, onBack }) {
  const { colors: C, gradient: GRAD, shadowSm } = useTheme();
  const insets   = useSafeAreaInsets();
  const scrollRef = useRef(null);

  const initMessage = `Your ATS match is ${result?.match_score ?? 0}%. I'll be running a challenging interview based on this role — no softballs. Let's start.`;

  const [messages, setMessages] = useState([
    { id: 0, text: initMessage, sender: 'interviewer' },
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { id: Date.now(), text: input.trim(), sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'interviewer' ? 'model' : 'user',
        parts: [m.text],
      }));
      const reply = await chatWithInterviewer(userMsg.text, result ?? {}, history);
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: reply, sender: 'interviewer' }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: 'Connection lost. Please try again.', sender: 'interviewer' },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const S = getStyles(C);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[S.container, { backgroundColor: C.bg }]}
    >
      {/* Header */}
      <LinearGradient
        colors={GRAD}
        style={[S.header, { paddingTop: insets.top + 16 }]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity onPress={onBack} style={S.backBtn}>
          <Text style={S.backText}>← End</Text>
        </TouchableOpacity>
        <View style={S.headerCenter}>
          <Text style={S.headerTitle}>AI Interviewer</Text>
          <View style={S.liveTag}>
            <View style={S.liveDot} />
            <Text style={S.liveText}>Live</Text>
          </View>
        </View>
        <View style={{ width: 64 }} />
      </LinearGradient>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={S.messageList}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              S.messageWrapper,
              msg.sender === 'user' ? S.userWrapper : S.interviewerWrapper,
            ]}
          >
            {msg.sender === 'interviewer' && (
              <LinearGradient colors={GRAD} style={S.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={{ fontSize: 12, color: '#fff', fontWeight: '800' }}>AI</Text>
              </LinearGradient>
            )}
            <View style={[
              S.bubble,
              { backgroundColor: msg.sender === 'user' ? C.primary : C.surface },
              shadowSm,
            ]}>
              <Text style={[
                S.bubbleText,
                { color: msg.sender === 'user' ? '#fff' : C.text },
              ]}>
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
        {loading && (
          <View style={S.interviewerWrapper}>
            <LinearGradient colors={GRAD} style={S.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={{ fontSize: 12, color: '#fff', fontWeight: '800' }}>AI</Text>
            </LinearGradient>
            <View style={[S.bubble, { backgroundColor: C.surface }, shadowSm, { paddingVertical: 18, paddingHorizontal: 24 }]}>
              <ActivityIndicator color={C.primary} size="small" />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={[S.inputArea, { backgroundColor: C.surface, borderTopColor: C.border, paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type your answer..."
          placeholderTextColor={C.border}
          style={[S.textInput, { backgroundColor: C.inputBg, borderColor: C.border, color: C.text }]}
          multiline
        />
        <TouchableOpacity onPress={sendMessage} disabled={!input.trim() || loading}>
          <LinearGradient
            colors={!input.trim() || loading ? ['#C4C4C4', '#C4C4C4'] : GRAD}
            style={S.sendBtn}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (C) => StyleSheet.create({
  container:          { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingBottom: 18, paddingHorizontal: 16,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  backText:           { color: '#fff', fontWeight: '700', fontSize: 14 },
  headerCenter:       { alignItems: 'center' },
  headerTitle:        { color: '#fff', fontSize: 16, fontWeight: '800' },
  liveTag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, marginTop: 4,
  },
  liveDot:            { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
  liveText:           { color: '#fff', fontSize: 11, fontWeight: '700' },
  messageList:        { flex: 1 },
  messageWrapper:     { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14, gap: 8 },
  userWrapper:        { justifyContent: 'flex-end' },
  interviewerWrapper: { justifyContent: 'flex-start' },
  avatar:             { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  bubble:             { maxWidth: '74%', borderRadius: 18, padding: 14 },
  bubbleText:         { fontSize: 14, lineHeight: 21 },
  inputArea: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 12, gap: 10, borderTopWidth: 1,
  },
  textInput: {
    flex: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 14, maxHeight: 120, borderWidth: 1.5,
  },
  sendBtn:            { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
