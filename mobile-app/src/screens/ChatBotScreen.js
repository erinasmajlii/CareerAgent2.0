import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { chatWithInterviewer } from '../api';

const GREETING = `Hey! I'm CareerAgent Bot 🤖\n\nI'm here to help with your career — resume tips, interview coaching, job search strategy, you name it.\n\nWhat can I help you with today?`;

const GENERAL_CONTEXT = {
  role: 'You are CareerAgent, a professional and friendly AI career assistant. Help users with resume writing, interview preparation, job searching, career transitions, salary negotiation, and professional development. Be concise, actionable, and encouraging.',
};

export default function ChatBotScreen({ navigation }) {
  const { colors: C, gradient: GRAD, shadowSm, isDark } = useTheme();
  const insets   = useSafeAreaInsets();
  const listRef  = useRef(null);

  const [messages, setMessages] = useState([{ id: 0, text: GREETING, sender: 'bot' }]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { id: Date.now(), text: input.trim(), sender: 'user' };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const history = messages.map((m) => ({
        role: m.sender === 'bot' ? 'model' : 'user',
        parts: [m.text],
      }));
      const reply = await chatWithInterviewer(userMsg.text, GENERAL_CONTEXT, history);
      setMessages((p) => [...p, { id: Date.now() + 1, text: reply, sender: 'bot' }]);
    } catch {
      setMessages((p) => [...p, { id: Date.now() + 1, text: 'Connection lost. Please try again.', sender: 'bot' }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessage = ({ item }) => {
    const isBot = item.sender === 'bot';
    return (
      <View style={[styles.msgRow, isBot ? styles.botRow : styles.userRow]}>
        {isBot && (
          <LinearGradient colors={GRAD} style={styles.botAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={{ fontSize: 16 }}>🤖</Text>
          </LinearGradient>
        )}
        <View style={[
          styles.bubble,
          isBot
            ? [{ backgroundColor: C.surface }, isDark ? { borderWidth: 1, borderColor: 'rgba(139,127,255,0.2)' } : shadowSm]
            : { backgroundColor: C.primary },
        ]}>
          <Text style={[styles.msgText, { color: isBot ? C.text : '#fff' }]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: C.bg }]}
    >
      {/* Header */}
      <LinearGradient colors={GRAD} style={[styles.header, { paddingTop: insets.top + 8 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>CareerAgent Bot</Text>
          <View style={styles.onlineDot}><View style={styles.dot} /><Text style={styles.onlineText}>Online</Text></View>
        </View>
        <View style={{ width: 64 }} />
      </LinearGradient>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 16 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      />

      {loading && (
        <View style={[styles.typingRow, { backgroundColor: C.surface, borderColor: isDark ? 'rgba(139,127,255,0.2)' : C.border }]}>
          <Text style={{ fontSize: 14, marginRight: 6 }}>🤖</Text>
          <ActivityIndicator color={C.primary} size="small" />
          <Text style={[styles.typingText, { color: C.subtext }]}>  typing…</Text>
        </View>
      )}

      {/* Input */}
      <View style={[styles.inputBar, { backgroundColor: C.surface, borderTopColor: isDark ? 'rgba(139,127,255,0.2)' : C.border, paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          value={input} onChangeText={setInput}
          placeholder="Ask anything about your career..."
          placeholderTextColor={C.border}
          style={[styles.textInput, { backgroundColor: C.inputBg, borderColor: C.border, color: C.text }]}
          multiline returnKeyType="send" onSubmitEditing={send}
        />
        <TouchableOpacity onPress={send} disabled={!input.trim() || loading}>
          <LinearGradient
            colors={!input.trim() || loading ? ['#C4C4C4', '#C4C4C4'] : GRAD}
            style={styles.sendBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 18, paddingHorizontal: 16 },
  backBtn:      { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  backText:     { color: '#fff', fontWeight: '700', fontSize: 14 },
  headerCenter: { alignItems: 'center' },
  headerTitle:  { color: '#fff', fontSize: 16, fontWeight: '800' },
  onlineDot:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  dot:          { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#4ADE80' },
  onlineText:   { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600' },
  msgRow:       { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, gap: 8 },
  botRow:       { justifyContent: 'flex-start' },
  userRow:      { justifyContent: 'flex-end' },
  botAvatar:    { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  bubble:       { maxWidth: '75%', borderRadius: 18, padding: 14 },
  msgText:      { fontSize: 14, lineHeight: 21 },
  typingRow:    { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 14, borderWidth: 1 },
  typingText:   { fontSize: 13 },
  inputBar:     { flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 10, borderTopWidth: 1 },
  textInput:    { flex: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, maxHeight: 120, borderWidth: 1.5 },
  sendBtn:      { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
