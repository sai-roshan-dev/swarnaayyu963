import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

export default function AboutAayuScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>About Aayu</ThemedText>
        <View style={{ width: 28 }} />
      </View>
      {/* Content */}
      <View style={styles.content}>
        <ThemedText style={styles.aayuName}><ThemedText style={styles.aayuHighlight}>Aayu</ThemedText> is your friendly AI companion, designed especially for elders. Aayu is more than just a health assistant—Aayu is a caring friend, always ready to listen, help, and bring a smile to your day.</ThemedText>
        <ThemedText style={styles.signature}>With warmth and care,{"\n"}The Aayu Team</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 0,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 32,
  },
  aayuName: {
    fontSize: 18,
    color: '#222',
    marginBottom: 40,
    lineHeight: 28,
  },
  aayuHighlight: {
    color: '#1976D2',
    fontWeight: 'bold',
    fontSize: 18,
  },
  signature: {
    fontSize: 18,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 40,
  },
}); 