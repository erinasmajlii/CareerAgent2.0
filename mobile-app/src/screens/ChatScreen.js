import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';

const API_BASE = 'http://172.20.10.3:8000/api';

export default function ChatScreen({ result, onBack }) {
  const initMessage = `I am a cynical, high-stakes technical recruiter. I see your match score is ${result.match_score}%. Let's see if you actually have what it takes.`;
  const [messages, setMessages] = useState([{ id: 0, text: initMessage, sender: 'ghost' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // We pass the entire past messages and the analysis context
      const response = await axios.post(`${API_BASE}/chat`, {
        message: userMsg.text,
        analysis_context: result,
        history: messages.map(m => ({role: m.sender === 'ghost' ? 'model' : 'user', parts: [m.text]}))
      });
      setMessages(prev => [...prev, { id: Date.now(), text: response.data.reply, sender: 'ghost' }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now(), text: 'CONNECTION LOST. THE RECRUITER HUNG UP.', sender: 'ghost' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
           <Text style={styles.backButtonText}>{`< ABORT`}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ghost Interviewer</Text>
        <View style={{ width: 64 }} />
      </View>
      <ScrollView style={styles.messageList} contentContainerStyle={{ paddingBottom: 20 }}>
        {messages.map(msg => (
          <View key={msg.id} style={[styles.messageWrapper, msg.sender === 'user' ? styles.userMsg : styles.ghostMsg]}>
            <View style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.ghostBubble]}>
               <Text style={[styles.messageText, msg.sender === 'user' ? styles.userText : styles.ghostText]}>{msg.text}</Text>
            </View>
          </View>
        ))}
        {loading && <ActivityIndicator color="#FFBF00" style={styles.loader} />}
      </ScrollView>
      <View style={styles.inputArea}>
        <TextInput 
          value={input}
          onChangeText={setInput}
          placeholder="TYPE YOUR RESPONSE..." 
          placeholderTextColor="#00FF4150"
          style={styles.textInput}
          multiline
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>[ SEND ]</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#00FF41',
    paddingBottom: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 16,
    backgroundColor: 'rgba(0, 255, 65, 0.2)',
    padding: 8,
    borderWidth: 1,
    borderColor: '#00FF41',
  },
  backButtonText: {
    color: '#00FF41',
    fontSize: 16,
    letterSpacing: 2,
  },
  headerTitle: {
    color: '#FFBF00',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    flex: 1,
    textAlign: 'center',
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageWrapper: {
    marginBottom: 16,
    width: '85%',
  },
  userMsg: {
    alignSelf: 'flex-end',
  },
  ghostMsg: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 16,
    borderRadius: 2,
    borderLeftWidth: 4,
  },
  userBubble: {
    backgroundColor: 'rgba(0, 255, 65, 0.1)',
    borderLeftColor: '#00FF41',
  },
  ghostBubble: {
    backgroundColor: 'rgba(255, 191, 0, 0.1)',
    borderLeftColor: '#FFBF00',
  },
  messageText: {
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  userText: {
    color: '#00FF41',
  },
  ghostText: {
    color: '#FFBF00',
  },
  loader: {
    alignSelf: 'flex-start',
    marginTop: 8,
    marginLeft: 16,
  },
  inputArea: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#00FF41',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#000000',
    color: '#00FF41',
    padding: 16,
    borderWidth: 1,
    borderColor: '#00FF41',
    fontFamily: 'monospace',
    minHeight: 56,
    letterSpacing: 1,
  },
  sendButton: {
    backgroundColor: '#00FF41',
    height: 56,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  }
});
