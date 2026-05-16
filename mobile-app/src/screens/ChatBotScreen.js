/**
 * ChatBotScreen.js
 *
 * Career-focused AI assistant powered by Google Vertex AI (Gemini).
 *
 * Features:
 *  • Calls Vertex AI generateContent REST API directly via fetch
 *  • System Instruction enforces strictly career-only topics
 *  • Profile collection state-machine: Location → Job/Role → Age
 *  • Full chat history sent on every request so the bot never repeats itself
 *  • handleSend manages UI state, loading indicator, and auto-scroll
 *
 * Environment variables required in .env:
 *   EXPO_PUBLIC_VERTEX_PROJECT_ID   – your GCP project ID
 *   EXPO_PUBLIC_VERTEX_LOCATION     – e.g. us-central1
 *   EXPO_PUBLIC_VERTEX_MODEL        – e.g. gemini-1.5-flash-001
 *   EXPO_PUBLIC_VERTEX_ACCESS_TOKEN – short-lived bearer token ("ya29....")
 *                                     Rotate this whenever it expires.
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

// ─── Vertex AI Config ─────────────────────────────────────────────────────────
const GCP_PROJECT  = process.env.EXPO_PUBLIC_VERTEX_PROJECT_ID   || 'YOUR_GCP_PROJECT_ID';
const GCP_LOCATION = process.env.EXPO_PUBLIC_VERTEX_LOCATION     || 'us-central1';
const GCP_MODEL    = process.env.EXPO_PUBLIC_VERTEX_MODEL        || 'gemini-1.5-flash-001';
const GCP_TOKEN    = process.env.EXPO_PUBLIC_VERTEX_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN';

const VERTEX_URL =
  `https://${GCP_LOCATION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT}` +
  `/locations/${GCP_LOCATION}/publishers/google/models/${GCP_MODEL}:generateContent`;

// ─── System Instruction ───────────────────────────────────────────────────────
/**
 * This instruction is injected at the top of every API call.
 * It enforces career-only behavior AND drives the profile collection flow.
 */
const SYSTEM_INSTRUCTION = `
You are CareerAgent, a professional and empathetic AI career assistant.

## Your Sole Purpose
Help users exclusively with career-related topics:
  - Resume writing & optimization
  - Job searching & application strategy
  - Interview coaching & preparation
  - Career transitions & pivots
  - Salary negotiation
  - Professional skill development

## Strict Topic Guardrail
If the user asks about ANYTHING outside career topics — sports, movies, music,
relationships, politics, cooking, technology unrelated to their career, or any
other off-topic subject — you must:
  1. Politely acknowledge you can't help with that specific topic.
  2. Briefly explain you are focused exclusively on career assistance.
  3. Immediately redirect back to the current step of the career profile.

Example redirect: "I appreciate the question, but I'm only able to help with
career-related topics! Let's get back to building your profile. [NEXT_QUESTION]"

## Profile Collection Flow
Before providing personalized career advice, you MUST collect three pieces of
information in order. Ask one at a time:

  STEP 1 — Location:    Ask for the user's city/country.
  STEP 2 — Current Role: Ask for their current job title or role (or "student" / "unemployed").
  STEP 3 — Age:         Ask for their age (used to tailor advice for career stage).

Once all three are collected, confirm the profile in a friendly summary and then
offer personalized career assistance based on that profile.

## Tone
Be concise, warm, encouraging, and professional. Use bullet points where helpful.
`.trim();

// ─── Profile Steps ─────────────────────────────────────────────────────────────
const PROFILE_STEPS = ['location', 'role', 'age'];

const PROFILE_QUESTIONS = {
  location: "👋 Welcome! I'm CareerAgent, your personal career assistant.\n\nTo give you the most relevant advice, let me build a quick profile.\n\n📍 **First question:** What city and country are you based in?",
  role:     "Great! 💼 **What is your current job title or role?**\n\n_(If you're a student or currently between jobs, just let me know!)_",
  age:      "Almost there! 🎯 **How old are you?**\n\n_(This helps me tailor advice to your career stage — entry-level, mid-career, etc.)_",
};

// ─── Vertex AI Fetch ──────────────────────────────────────────────────────────
/**
 * Calls the Vertex AI generateContent REST endpoint.
 *
 * @param {Array}  history  – Array of { role: 'user'|'model', parts: [{ text }] }
 * @param {String} newText  – The latest user message text
 * @returns {Promise<string>} – The model's reply text
 */
async function callVertexAI(history, newText) {
  // Build the content array: system instruction first, then full history, then new user turn
  const contents = [
    ...history,
    { role: 'user', parts: [{ text: newText }] },
  ];

  const body = {
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents,
    generationConfig: {
      temperature:     0.7,
      maxOutputTokens: 1024,
      topP:            0.9,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  };

  const response = await fetch(VERTEX_URL, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${GCP_TOKEN}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('[Vertex AI Error]', response.status, errText);
    throw new Error(`Vertex AI responded with ${response.status}`);
  }

  const json = await response.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Vertex AI');
  return text.trim();
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ChatBotScreen({ navigation }) {
  const { colors: C, gradient: GRAD, shadowSm, isDark } = useTheme();
  const insets  = useSafeAreaInsets();
  const listRef = useRef(null);

  // ── Message list state ──────────────────────────────────────────────────────
  const [messages, setMessages] = useState([
    {
      id:     'greeting',
      text:   PROFILE_QUESTIONS.location,
      sender: 'bot',
    },
  ]);

  // ── Profile collection state ────────────────────────────────────────────────
  const [profileStep, setProfileStep] = useState(0);   // 0=location,1=role,2=age,3=done
  const [profile, setProfile]         = useState({ location: '', role: '', age: '' });

  // ── API conversation history (Vertex AI format) ─────────────────────────────
  // Excludes system instruction; that is injected on every call separately.
  const conversationHistory = useRef([]);

  // ── Input & loading state ───────────────────────────────────────────────────
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);

  // ── Typing animation dots ───────────────────────────────────────────────────
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const startTypingAnimation = useCallback(() => {
    const pulse = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    pulse(dot1, 0);
    pulse(dot2, 150);
    pulse(dot3, 300);
  }, [dot1, dot2, dot3]);

  const stopTypingAnimation = useCallback(() => {
    [dot1, dot2, dot3].forEach((d) => { d.stopAnimation(); d.setValue(0); });
  }, [dot1, dot2, dot3]);

  // ── Append a message to UI ──────────────────────────────────────────────────
  const appendMessage = useCallback((text, sender) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, text, sender },
    ]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120);
  }, []);

  // ── handleSend ──────────────────────────────────────────────────────────────
  /**
   * Core function:
   *  1. Validates input
   *  2. Appends user message to UI
   *  3. Updates profile step if we're still collecting
   *  4. Calls Vertex AI with full conversation history
   *  5. Appends bot reply and updates history
   */
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    // 1 ── Append user message to UI
    appendMessage(text, 'user');
    setInput('');
    setLoading(true);
    startTypingAnimation();

    // 2 ── Update profile if still in collection phase
    let updatedProfile = { ...profile };
    let nextStep       = profileStep;

    if (profileStep < PROFILE_STEPS.length) {
      const key = PROFILE_STEPS[profileStep];
      updatedProfile = { ...updatedProfile, [key]: text };
      setProfile(updatedProfile);
      nextStep = profileStep + 1;
      setProfileStep(nextStep);
    }

    // 3 ── Build history entry for this user turn
    conversationHistory.current = [
      ...conversationHistory.current,
      { role: 'user', parts: [{ text }] },
    ];

    try {
      // 4 ── If we just collected the last profile field, inject a summary
      //       into the user message so the model has full context.
      let apiUserText = text;
      if (nextStep === PROFILE_STEPS.length) {
        // Age was just captured — hand model the complete profile in context
        apiUserText =
          `My age is: ${text}.\n\n` +
          `[Profile complete]\n` +
          `Location: ${updatedProfile.location}\n` +
          `Current Role: ${updatedProfile.role}\n` +
          `Age: ${text}\n\n` +
          `Please confirm my profile and tell me how you can help me as a career assistant.`;
      }

      // Pass history BEFORE this turn (the current turn is added separately in callVertexAI)
      const historyBeforeThisTurn = conversationHistory.current.slice(0, -1);
      const reply = await callVertexAI(historyBeforeThisTurn, apiUserText);

      // 5 ── Append bot reply to UI and history
      appendMessage(reply, 'bot');
      conversationHistory.current = [
        ...conversationHistory.current,
        { role: 'model', parts: [{ text: reply }] },
      ];

      // If still in profile collection, prompt the next question after the bot reply
      if (nextStep < PROFILE_STEPS.length) {
        const nextQuestion = PROFILE_QUESTIONS[PROFILE_STEPS[nextStep]];
        setTimeout(() => appendMessage(nextQuestion, 'bot'), 400);
      }
    } catch (err) {
      console.error('[ChatBot handleSend]', err);
      appendMessage(
        '⚠️ Connection issue. Please check your network or token and try again.',
        'bot'
      );
    } finally {
      setLoading(false);
      stopTypingAnimation();
    }
  }, [input, loading, profile, profileStep, appendMessage, startTypingAnimation, stopTypingAnimation]);

  // ─── Render a single chat bubble ────────────────────────────────────────────
  const renderMessage = useCallback(({ item }) => {
    const isBot = item.sender === 'bot';
    return (
      <View style={[styles.msgRow, isBot ? styles.botRow : styles.userRow]}>
        {isBot && (
          <LinearGradient
            colors={GRAD}
            style={styles.botAvatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={{ fontSize: 16 }}>🤖</Text>
          </LinearGradient>
        )}
        <View
          style={[
            styles.bubble,
            isBot
              ? [
                  { backgroundColor: C.surface },
                  isDark
                    ? { borderWidth: 1, borderColor: 'rgba(139,127,255,0.2)' }
                    : shadowSm,
                ]
              : { backgroundColor: C.primary },
          ]}
        >
          <Text style={[styles.msgText, { color: isBot ? C.text : '#fff' }]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  }, [C, GRAD, isDark, shadowSm]);

  // ─── Profile progress banner ─────────────────────────────────────────────────
  const renderProgressBar = () => {
    if (profileStep >= PROFILE_STEPS.length) return null;
    const labels  = ['Location', 'Role', 'Age'];
    const pct     = profileStep / PROFILE_STEPS.length;
    return (
      <View style={[styles.progressWrap, { backgroundColor: C.surface, borderBottomColor: isDark ? 'rgba(139,127,255,0.2)' : C.border }]}>
        <Text style={[styles.progressLabel, { color: C.subtext }]}>
          Profile setup · Step {profileStep + 1} of {PROFILE_STEPS.length} — {labels[profileStep]}
        </Text>
        <View style={[styles.progressTrack, { backgroundColor: isDark ? '#1E1B3A' : '#E4E2FF' }]}>
          <LinearGradient
            colors={GRAD}
            style={[styles.progressFill, { width: `${Math.round(pct * 100 + 5)}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
      </View>
    );
  };

  // ─── Typing indicator ────────────────────────────────────────────────────────
  const renderTypingIndicator = () => {
    if (!loading) return null;
    return (
      <View style={[styles.typingRow, {
        backgroundColor: C.surface,
        borderColor: isDark ? 'rgba(139,127,255,0.2)' : C.border,
      }]}>
        <Text style={{ fontSize: 14, marginRight: 8 }}>🤖</Text>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={[styles.typingDot, { backgroundColor: C.primary, opacity: dot, transform: [{ scale: dot.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }]}
          />
        ))}
      </View>
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: C.bg }]}
    >
      {/* ── Header ── */}
      <LinearGradient
        colors={GRAD}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>CareerAgent Bot</Text>
          <View style={styles.onlineRow}>
            <View style={styles.dot} />
            <Text style={styles.onlineText}>AI Career Assistant</Text>
          </View>
        </View>

        {/* Spacer to balance the back button */}
        <View style={{ width: 72 }} />
      </LinearGradient>

      {/* ── Profile Progress ── */}
      {renderProgressBar()}

      {/* ── Message List ── */}
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      />

      {/* ── Typing Indicator ── */}
      {renderTypingIndicator()}

      {/* ── Input Bar ── */}
      <View style={[
        styles.inputBar,
        {
          backgroundColor:  C.surface,
          borderTopColor:   isDark ? 'rgba(139,127,255,0.2)' : C.border,
          paddingBottom:    insets.bottom + 8,
        },
      ]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={
            profileStep === 0 ? 'Enter your city / country…'
            : profileStep === 1 ? 'Enter your job title or role…'
            : profileStep === 2 ? 'Enter your age…'
            : 'Ask anything about your career…'
          }
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
        <TouchableOpacity
          onPress={handleSend}
          disabled={!input.trim() || loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={!input.trim() || loading ? ['#9CA3AF', '#9CA3AF'] : GRAD}
            style={styles.sendBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:     { flex: 1 },

  // Header
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 18, paddingHorizontal: 16 },
  backBtn:       { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  backText:      { color: '#fff', fontWeight: '700', fontSize: 14 },
  headerCenter:  { alignItems: 'center', flex: 1 },
  headerTitle:   { color: '#fff', fontSize: 16, fontWeight: '800' },
  onlineRow:     { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  dot:           { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#4ADE80' },
  onlineText:    { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600' },

  // Progress bar
  progressWrap:  { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  progressLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  progressTrack: { height: 5, borderRadius: 3, overflow: 'hidden' },
  progressFill:  { height: 5, borderRadius: 3 },

  // Messages
  msgRow:        { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14, gap: 8 },
  botRow:        { justifyContent: 'flex-start' },
  userRow:       { justifyContent: 'flex-end' },
  botAvatar:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bubble:        { maxWidth: '78%', borderRadius: 18, padding: 14 },
  msgText:       { fontSize: 14, lineHeight: 22 },

  // Typing indicator
  typingRow:     { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 14, borderWidth: 1, gap: 4 },
  typingDot:     { width: 8, height: 8, borderRadius: 4 },

  // Input bar
  inputBar:      { flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 10, borderTopWidth: 1 },
  textInput:     { flex: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, maxHeight: 120, borderWidth: 1.5 },
  sendBtn:       { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
