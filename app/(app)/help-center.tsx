import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useLanguage } from '@/context/LanguageContext';

export default function HelpCenterScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const helpItems = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of using Aayu',
      icon: 'play-circle-outline',
    },
    {
      title: 'Voice Commands',
      description: 'How to interact with Aayu using voice',
      icon: 'mic-outline',
    },
    {
      title: 'Settings & Preferences',
      description: 'Customize your Aayu experience',
      icon: 'settings-outline',
    },
    {
      title: 'Troubleshooting',
      description: 'Common issues and solutions',
      icon: 'help-circle-outline',
    },
    // {
    //   title: 'Contact Support',
    //   description: 'Get in touch with our support team',
    //   icon: 'mail-outline',
    // },
  ];

  const handleEmailLink = async () => {
    const url = 'mailto:contact@swarnaayu.com';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(t('error'), t('cannot_open_email'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('cannot_open_email'));
      console.error('Email link error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>Help Center</ThemedText>
        <View style={{ width: 28 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.welcomeText}>
          Welcome to the Aayu Help Center! Find answers to common questions and learn how to make the most of your AI companion.
        </ThemedText>

        <View style={styles.helpItemsContainer}>
          {helpItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.helpItem}>
              <View style={styles.helpItemIcon}>
                <Ionicons name={item.icon as any} size={24} color="#1976D2" />
              </View>
              <View style={styles.helpItemContent}>
                <ThemedText style={styles.helpItemTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.helpItemDescription}>{item.description}</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contactSection}>
          <ThemedText style={styles.contactTitle}>Need More Help?</ThemedText>
          <ThemedText style={styles.contactText}>
            If you can't find what you're looking for, our support team is here to help you.
          </ThemedText>
          <TouchableOpacity style={styles.contactButton} onPress={handleEmailLink}>
            <MaterialIcons name="support-agent" size={20} color="#fff" />
            <ThemedText style={styles.contactButtonText}>Contact Support</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
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
    padding: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 30,
    textAlign: 'center',
  },
  helpItemsContainer: {
    marginBottom: 40,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  helpItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  helpItemContent: {
    flex: 1,
  },
  helpItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  helpItemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactSection: {
    backgroundColor: '#f8f9fa',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976D2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});