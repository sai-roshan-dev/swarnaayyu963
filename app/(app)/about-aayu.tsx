import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useLanguage } from '@/context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function AboutAayuScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

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

  const handleSignaturePress = () => {
    Alert.alert(t('aayu_team'), t('aayu_team_message'));
  };

  const features = [
    { icon: 'chatbubble-outline', text: 'Friendly chats anytime' },
    { icon: 'alarm-outline', text: 'Gentle daily reminders' },
    { icon: 'newspaper-outline', text: 'Latest news updates' },
    { icon: 'heart-outline', text: 'Support at your pace' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel={t('go_back')} accessibilityRole="button">
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>About Aayu</ThemedText>
        <View style={{ width: 28 }} />
      </View>

      {/* Content */}
      <LinearGradient
        colors={['#f0f4f8', '#ffffff']}
        style={styles.content}
      >
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          {/* <View style={styles.logoContainer}>
            <Ionicons name="heart" size={60} color="#1976D2" />
          </View> */}
          <ThemedText style={styles.aayuName}>
            Meet <ThemedText style={styles.aayuHighlight}>Aayu</ThemedText>, your friendly AI companion crafted for seniors. Aayu chats with you, shares daily news, and offers gentle reminders to keep you on track—all at your pace, with warmth and care.
          </ThemedText>

          <View style={styles.featuresContainer}>
            <ThemedText style={styles.featuresTitle}>What Aayu Offers</ThemedText>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name={feature.icon as any} size={24} color="#1976D2" style={styles.featureIcon} />
                <ThemedText style={styles.featureText}>{feature.text}</ThemedText>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleEmailLink}
            accessibilityLabel={t('contact_aayu_team')}
            accessibilityRole="button"
          >
            <ThemedText style={styles.contactButtonText}>Get in Touch</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSignaturePress} accessibilityLabel={t('aayu_team')}>
            <ThemedText style={styles.signature}>
              With warmth and care,{"\n"}The Aayu Team
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    padding: 24,
    paddingTop: 22,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  aayuName: {
    fontSize: 20,
    color: '#222',
    lineHeight: 30,
    textAlign: 'center',
    marginBottom: 24,
  },
  aayuHighlight: {
    color: '#1976D2',
    fontWeight: 'bold',
    fontSize: 20,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 16,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
  },
  contactButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signature: {
    fontSize: 18,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'right',
  },
});