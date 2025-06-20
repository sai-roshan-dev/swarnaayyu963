import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabOneScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <IconSymbol size={48} name="house.fill" color="#007AFF" />
        <ThemedText type="title" style={styles.title}>
          Welcome to SwarnAayu
        </ThemedText>
      </View>
      
      <View style={styles.content}>
        <ThemedText type="default" style={styles.description}>
          Your AI-powered health companion
        </ThemedText>
        
        <View style={styles.features}>
          <View style={styles.feature}>
            <IconSymbol size={24} name="mic.fill" color="#34C759" />
            <ThemedText type="defaultSemiBold">Voice Chat</ThemedText>
          </View>
          
          <View style={styles.feature}>
            <IconSymbol size={24} name="brain.head.profile" color="#FF9500" />
            <ThemedText type="defaultSemiBold">AI Assistant</ThemedText>
          </View>
          
          <View style={styles.feature}>
            <IconSymbol size={24} name="heart.fill" color="#FF3B30" />
            <ThemedText type="defaultSemiBold">Health Insights</ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    marginTop: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 18,
  },
  features: {
    gap: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
}); 