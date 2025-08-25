import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';

const { width } = Dimensions.get('window');

const LANGUAGES = [
  { label: 'English', value: 'English' },
  { label: 'Hindi', value: 'Hindi' },
];

export default function LanguageOnboarding() {
  const { language, setLanguage } = useLanguage();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Back Arrow */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/font-size-onboarding' as any)}>
        <Ionicons name="arrow-back" size={28} color="#222" />
      </TouchableOpacity>
      {/* Question */}
      <Text style={styles.question}>{`Which Language do
you prefer?`}</Text>
      {/* Radio Options */}
      <View style={styles.radioGroup}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.value}
            style={styles.radioOption}
            onPress={() => setLanguage(lang.value as 'English' | 'Hindi')}
          >
            <View style={[styles.radioCircle, language === lang.value && styles.radioCircleSelected]}>
              {language === lang.value && <View style={styles.radioDot} />}
            </View>
            <Text style={[styles.radioLabel, language === lang.value && styles.radioLabelSelected]}>{lang.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Proceed Button */}
      <TouchableOpacity
        style={[styles.button, !language && styles.buttonDisabled]}
        onPress={() => router.replace('/on-boarding' as any)}
        disabled={!language}
      >
        <Text style={styles.buttonText}>Proceed</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  question: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 48,
    marginTop: -60,
    lineHeight: 40,
  },
  radioGroup: {
    width: width * 0.7,
    alignSelf: 'center',
    marginBottom: 48,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  radioCircle: {
    height: 28,
    width: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginRight: 16,
  },
  radioCircleSelected: {
    borderColor: '#564CF3',
  },
  radioDot: {
    height: 14,
    width: 14,
    borderRadius: 7,
    backgroundColor: '#564CF3',
  },
  radioLabel: {
    fontSize: 22,
    color: '#222',
    fontWeight: '400',
  },
  radioLabelSelected: {
    color: '#564CF3',
    fontWeight: '700',
  },
  button: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24,
    backgroundColor: '#564CF3',
    paddingVertical: 20,
    borderRadius: 14,
    alignItems: 'center',
    width: width - 48,
    shadowColor: '#564CF3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
}); 