/**
 * ChatBotScreen.js — Gemini API powered career assistant
 * Uses EXPO_PUBLIC_GEMINI_API_KEY (Google AI Studio)
 * Model: gemini-2.0-flash-lite (highest free-tier rate limits)
 * Robust error handling: retries, backoff, user-friendly messages
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
// gemini-2.0-flash-lite has the highest free-tier limits (1500 RPD, 30 RPM)
const GEMINI_MODEL = 'gemini-2.0-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// ─── User-friendly error messages per HTTP status ────────────────────────────
function getErrorMessage(status, retryAfterSec) {
  switch (status) {
    case 429:
      return retryAfterSec
        ? `⏳ I'm getting a lot of requests right now. Please wait ${retryAfterSec} seconds and try again.`
        : '⏳ Too many requests. Please wait a moment and try again.';
    case 401:
    case 403:
      return '🔑 API key issue. Please check your Gemini API key in .env and restart the app.';
    case 404:
      return '🔍 AI model not found. Please contact support.';
    case 500:
    case 503:
      return '🛠️ Google AI is temporarily unavailable. Please try again in a minute.';
    default:
      return '⚠️ Something went wrong. Please check your connection and try again.';
  }
}

// ─── Sleep helper ────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const SYSTEM_INSTRUCTION = `You are CareerAgent, a professional and empathetic AI career assistant.
Your sole purpose is helping with career topics: resume writing, job searching, interview coaching, career transitions, salary negotiation, and skill development.
If the user asks about anything unrelated to careers, politely decline and redirect to career help.
Be concise, warm, encouraging, and professional. Use bullet points where helpful. Keep replies under 200 words unless detail is genuinely needed.`.trim();

const PROFILE_STEPS = ['location', 'role', 'age'];

const BOT_INTRO_MESSAGES = [
  "👋 Hey! I'm **CareerAgent** — your personal AI career co-pilot.\n\nI'm here to help you land your dream job. Let me ask you 3 quick questions to personalise your experience! 🚀",
  "📍 **Question 1 of 3:** What city and country are you based in?",
  "💼 **Question 2 of 3:** What is your current job title or role?\n_(Student or between jobs? Just let me know!)_",
  "🎯 **Question 3 of 3:** How old are you?\n_(Helps me tailor advice to your career stage.)_",
];

async function callGeminiAPI(history, newText, retryCount = 0) {
  const MAX_RETRIES = 2;
  const contents = [...history, { role: 'user', parts: [{ text: newText }] }];
  const body = {
    system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024, topP: 0.9 },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  };

  let response;
  try {
    response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    // No connection at all
    throw { status: 0, message: '📡 No internet connection. Please check your network and try again.' };
  }

  if (!response.ok) {
    const errText = await response.text();
    console.error('[Gemini Error]', response.status, errText);

    // 429: Rate limit — parse retry-after and auto-retry with backoff
    if (response.status === 429) {
      let retryAfterSec = 10;
      try {
        const errJson = JSON.parse(errText);
        const retryInfo = errJson?.error?.details?.find((d) => d['@type']?.includes('RetryInfo'));
        if (retryInfo?.retryDelay) {
          retryAfterSec = parseInt(retryInfo.retryDelay, 10) || 10;
        }
      } catch (_) {}

      if (retryCount < MAX_RETRIES) {
        console.log(`[Gemini] 429 — retrying in ${retryAfterSec}s (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await sleep(retryAfterSec * 1000);
        return callGeminiAPI(history, newText, retryCount + 1);
      }
      throw { status: 429, retryAfterSec, message: getErrorMessage(429, retryAfterSec) };
    }

    throw { status: response.status, message: getErrorMessage(response.status) };
  }

  let json;
  try {
    json = await response.json();
  } catch (_) {
    throw { status: 0, message: '⚠️ Received an unreadable response. Please try again.' };
  }

  // Safety block
  const finishReason = json?.candidates?.[0]?.finishReason;
  if (finishReason === 'SAFETY') {
    return "⚠️ I couldn't respond to that — it was flagged by safety filters. Let's keep focused on your career goals! What would you like help with?";
  }

  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw { status: 0, message: '🤔 I received an empty response. Please try rephrasing your message.' };
  }
  return text.trim();
}

export default function ChatBotScreen({ navigation }) {
  const { colors: C, gradient: GRAD, shadowSm, isDark } = useTheme();
  const insets  = useSafeAreaInsets();
  const listRef = useRef(null);

  const [messages,     setMessages]     = useState([]);
  const [profileStep,  setProfileStep]  = useState(0);
  const [profile,      setProfile]      = useState({ location: '', role: '', age: '' });
  const [input,        setInput]        = useState('');
  const [loading,      setLoading]      = useState(false);

  const conversationHistory = useRef([]);
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const startTyping = useCallback(() => {
    const pulse = (dot, delay) =>
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
      ])).start();
    pulse(dot1, 0); pulse(dot2, 150); pulse(dot3, 300);
  }, [dot1, dot2, dot3]);

  const stopTyping = useCallback(() => {
    [dot1, dot2, dot3].forEach((d) => { d.stopAnimation(); d.setValue(0); });
  }, [dot1, dot2, dot3]);

  const appendMessage = useCallback((text, sender) => {
    setMessages((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, text, sender }]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120);
  }, []);

  // On mount: send greeting then first question
  useEffect(() => {
    const t1 = setTimeout(() => appendMessage(BOT_INTRO_MESSAGES[0], 'bot'), 700);
    const t2 = setTimeout(() => appendMessage(BOT_INTRO_MESSAGES[1], 'bot'), 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    appendMessage(text, 'user');
    setInput('');

    // ── Profile collection: handle locally, NO API call needed ──────────────
    if (profileStep < PROFILE_STEPS.length) {
      const key = PROFILE_STEPS[profileStep];
      const updatedProfile = { ...profile, [key]: text };
      setProfile(updatedProfile);
      const nextStep = profileStep + 1;
      setProfileStep(nextStep);

      // Local acknowledgement responses — zero API usage
      const acks = [
        `Got it! 📍 **${text}** — noted!`,
        `Perfect! 💼 **${text}** — I've got that.`,
        `Great! 🎯 Age **${text}** noted.`,
      ];

      setTimeout(() => {
        appendMessage(acks[profileStep], 'bot');

        if (nextStep < PROFILE_STEPS.length) {
          // Ask next profile question
          setTimeout(() => appendMessage(BOT_INTRO_MESSAGES[nextStep + 1], 'bot'), 600);
        } else {
          // Profile complete — now call AI for the personalised summary
          setTimeout(async () => {
            setLoading(true);
            startTyping();
            const summaryPrompt =
              `[Profile complete]\nLocation: ${updatedProfile.location}\nCurrent Role: ${updatedProfile.role}\nAge: ${text}\n\n` +
              `Please confirm my profile in a warm, friendly summary (2-3 sentences) and tell me the top 3 ways you can specifically help me based on this background.`;
            conversationHistory.current = [
              { role: 'user', parts: [{ text: summaryPrompt }] },
            ];
            try {
              const reply = await callGeminiAPI([], summaryPrompt);
              appendMessage(reply, 'bot');
              conversationHistory.current = [
                ...conversationHistory.current,
                { role: 'model', parts: [{ text: reply }] },
              ];
            } catch (err) {
              // On failure, show a local profile summary so conversation can continue
              appendMessage(
                `✅ Profile saved!\n\n📍 **Location:** ${updatedProfile.location}\n💼 **Role:** ${updatedProfile.role}\n🎯 **Age:** ${text}\n\nI’m ready to help! Ask me anything about your career — resumes, interviews, job searching, and more.`,
                'bot'
              );
            } finally {
              setLoading(false);
              stopTyping();
            }
          }, 800);
        }
      }, 400);
      return; // ← exit early, no API call for profile steps
    }

    // ── Free-form career question — call Gemini ──────────────────────────────

    setLoading(true);
    startTyping();
    conversationHistory.current = [
      ...conversationHistory.current,
      { role: 'user', parts: [{ text }] },
    ];

    try {
      const historyBeforeThisTurn = conversationHistory.current.slice(0, -1);
      const reply = await callGeminiAPI(historyBeforeThisTurn, text);
      appendMessage(reply, 'bot');
      conversationHistory.current = [
        ...conversationHistory.current,
        { role: 'model', parts: [{ text: reply }] },
      ];
    } catch (err) {
      console.error('[ChatBot]', err);
      appendMessage(
        err?.message || '⚠️ Connection issue. Please check your network and try again.',
        'bot'
      );
    } finally {
      setLoading(false);
      stopTyping();
    }
  }, [input, loading, profile, profileStep, appendMessage, startTyping, stopTyping]);



  const renderMessage = useCallback(({ item }) => {
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
  }, [C, GRAD, isDark, shadowSm]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <LinearGradient colors={GRAD} style={styles.emptyOrb} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={{ fontSize: 36 }}>🤖</Text>
      </LinearGradient>
      <Text style={[styles.emptyTitle, { color: C.text }]}>CareerAgent is starting…</Text>
      <Text style={[styles.emptySubtitle, { color: C.subtext }]}>Your AI career assistant is ready</Text>
    </View>
  );

  const renderProgressBar = () => {
    if (profileStep >= PROFILE_STEPS.length) return null;
    const labels = ['Location', 'Role', 'Age'];
    const pct = profileStep / PROFILE_STEPS.length;
    return (
      <View style={[styles.progressWrap, { backgroundColor: C.surface, borderBottomColor: isDark ? 'rgba(139,127,255,0.2)' : C.border }]}>
        <Text style={[styles.progressLabel, { color: C.subtext }]}>
          Profile setup · Step {profileStep + 1} of {PROFILE_STEPS.length} — {labels[profileStep]}
        </Text>
        <View style={[styles.progressTrack, { backgroundColor: isDark ? '#1E1B3A' : '#E4E2FF' }]}>
          <LinearGradient colors={GRAD} style={[styles.progressFill, { width: `${Math.round(pct * 100 + 5)}%` }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!loading) return null;
    return (
      <View style={[styles.typingRow, { backgroundColor: C.surface, borderColor: isDark ? 'rgba(139,127,255,0.2)' : C.border }]}>
        <Text style={{ fontSize: 14, marginRight: 8 }}>🤖</Text>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View key={i} style={[styles.typingDot, {
            backgroundColor: C.primary,
            opacity: dot,
            transform: [{ scale: dot.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
          }]} />
        ))}
      </View>
    );
  };

  const inputPlaceholder =
    profileStep === 0 ? 'Enter your city / country…'
    : profileStep === 1 ? 'Enter your job title or role…'
    : profileStep === 2 ? 'Enter your age…'
    : 'Ask anything about your career…';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: C.bg }]}>
      <LinearGradient colors={GRAD} style={[styles.header, { paddingTop: insets.top + 8 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>CareerAgent Bot</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>AI Career Assistant</Text>
          </View>
        </View>
        <View style={{ width: 72 }} />
      </LinearGradient>

      {renderProgressBar()}

      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 8, flexGrow: 1 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      {renderTypingIndicator()}

      <View style={[styles.inputBar, {
        backgroundColor: C.surface,
        borderTopColor:  isDark ? 'rgba(139,127,255,0.2)' : C.border,
        paddingBottom:   insets.bottom + 8,
      }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={inputPlaceholder}
          placeholderTextColor={C.subtext}
          style={[styles.textInput, {
            backgroundColor: C.inputBg,
            borderColor:     isDark ? 'rgba(139,127,255,0.3)' : C.border,
            color:           C.text,
          }]}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity onPress={handleSend} disabled={!input.trim() || loading} activeOpacity={0.8}>
          <LinearGradient colors={!input.trim() || loading ? ['#9CA3AF', '#9CA3AF'] : GRAD} style={styles.sendBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>→</Text>
            }
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 18, paddingHorizontal: 16 },
  backBtn:       { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  backText:      { color: '#fff', fontWeight: '700', fontSize: 14 },
  headerCenter:  { alignItems: 'center', flex: 1 },
  headerTitle:   { color: '#fff', fontSize: 16, fontWeight: '800' },
  onlineRow:     { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  onlineDot:     { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#4ADE80' },
  onlineText:    { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600' },
  progressWrap:  { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  progressLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  progressTrack: { height: 5, borderRadius: 3, overflow: 'hidden' },
  progressFill:  { height: 5, borderRadius: 3 },
  emptyState:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyOrb:      { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
  emptyTitle:    { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  emptySubtitle: { fontSize: 14 },
  msgRow:        { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14, gap: 8 },
  botRow:        { justifyContent: 'flex-start' },
  userRow:       { justifyContent: 'flex-end' },
  botAvatar:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bubble:        { maxWidth: '78%', borderRadius: 18, padding: 14 },
  msgText:       { fontSize: 14, lineHeight: 22 },
  typingRow:     { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 14, borderWidth: 1, gap: 4 },
  typingDot:     { width: 8, height: 8, borderRadius: 4 },
  inputBar:      { flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 10, borderTopWidth: 1 },
  textInput:     { flex: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, maxHeight: 120, borderWidth: 1.5 },
  sendBtn:       { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
