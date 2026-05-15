import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export default function DashboardScreen({ result, onStartChat }) {
  if (!result) return null;

  const scoreValueStyle = result.match_score >= 70 ? { color: '#00FF41' } : { color: '#FFBF00' };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        === INTEL DASHBOARD ===
      </Text>

      <View style={styles.scoreBox}>
        <View style={styles.badge}>
           <Text style={styles.badgeText}>ANALYSIS</Text>
        </View>
        <Text style={styles.scoreLabel}>Match Score</Text>
        <Text style={[styles.scoreValue, scoreValueStyle]}>
          {result.match_score}%
        </Text>
      </View>

      <View style={styles.cheatSheetSection}>
        <Text style={styles.sectionTitle}>
          [ The Cheat Sheet ]
        </Text>
        {result.cheat_sheet.map((item, index) => (
          <View key={index} style={styles.cheatItem}>
             <Text style={styles.bullet}>{`>`}</Text>
             <Text style={styles.cheatText}>{item}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={onStartChat}
      >
        <Text style={styles.buttonText}>
          INITIATE GHOST INTERVIEW
        </Text>
      </TouchableOpacity>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>... Incoming Live Intelligence Feed ...</Text>
        <Text style={styles.footerText}>Found 404 targets. Re-routing host to port 22.</Text>
        <Text style={styles.footerText}>Encrypted payload delivered.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 24,
  },
  title: {
    color: '#00FF41',
    fontSize: 24,
    marginBottom: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
  },
  scoreBox: {
    borderWidth: 2,
    borderColor: '#00FF41',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    position: 'relative',
    backgroundColor: 'rgba(0, 255, 65, 0.05)',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 4,
    backgroundColor: '#00FF41',
  },
  badgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: '#00FF41',
    fontSize: 18,
    marginBottom: 8,
    letterSpacing: 2,
  },
  scoreValue: {
    fontSize: 72,
    fontWeight: '900',
  },
  cheatSheetSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#FFBF00',
    fontSize: 18,
    marginBottom: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  cheatItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFBF00',
    paddingLeft: 12,
  },
  bullet: {
    color: '#FFBF00',
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 2,
  },
  cheatText: {
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#00FF41',
    paddingVertical: 16,
    borderRadius: 2,
  },
  buttonText: {
    color: '#000000',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  footer: {
    marginTop: 32,
    paddingBottom: 48,
    opacity: 0.5,
  },
  footerText: {
    color: '#00FF41',
    fontSize: 12,
    marginTop: 4,
  }
});
