/**
 * LandingScreen.js — Legacy stub, not used in navigation.
 * The app flows: Onboarding → Login → Home (MainTabs)
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LandingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>This screen is not used.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F4FF', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#6B7280', fontSize: 14 },
});
