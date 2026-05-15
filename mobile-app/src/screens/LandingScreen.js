import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';

export default function LandingScreen({ onAnalyze }) {
  const [jdText, setJdText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setResumeFile(result.assets[0]);
      }
    } catch (e) {
      console.log('Document picker Error:', e);
    }
  };

  const handleInfiltrate = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (!jdText) return alert("JD Text is required.");
    
    setLoading(true);
    await onAnalyze(resumeFile?.uri, jdText);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        [ SYSTEM ACCESS ]
      </Text>
      
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input}
          placeholder="PASTE JOB DESCRIPTION HERE..."
          placeholderTextColor="#00FF4180"
          value={jdText}
          onChangeText={setJdText}
          multiline
        />
        <View style={styles.labelContainer}><Text style={styles.labelText}>TARGET</Text></View>
      </View>

      <TouchableOpacity 
        style={[styles.picker, resumeFile ? styles.pickerFile : styles.pickerEmpty]}
        onPress={handlePickDocument}
      >
        <Text style={[styles.pickerText, resumeFile ? styles.textWarning : styles.textMatrix]}>
          {resumeFile ? `[+] ${resumeFile.name}` : '> SELECT TARGET FILE (PDF) <'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={handleInfiltrate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000000" />
        ) : (
           <Text style={styles.buttonText}>
            [ INFILTRATE ]
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#00FF41',
    fontSize: 32,
    marginBottom: 48,
    fontWeight: 'bold',
    letterSpacing: 4,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
    position: 'relative',
  },
  input: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#00FF41',
    color: '#00FF41',
    padding: 16,
    height: 128,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
  },
  labelContainer: {
    position: 'absolute',
    top: 4,
    left: 8,
  },
  labelText: {
    color: '#00FF41',
    opacity: 0.3,
    fontSize: 10,
  },
  picker: {
    width: '100%',
    borderWidth: 2,
    padding: 16,
    marginBottom: 32,
  },
  pickerEmpty: {
    borderColor: '#00FF41',
    borderStyle: 'dashed',
  },
  pickerFile: {
    borderColor: '#FFBF00',
  },
  pickerText: {
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  textMatrix: {
    color: '#00FF41',
  },
  textWarning: {
    color: '#FFBF00',
  },
  button: {
    width: '100%',
    backgroundColor: '#00FF41',
    paddingVertical: 16,
    borderRadius: 2,
  },
  buttonText: {
    color: '#000000',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  }
});
