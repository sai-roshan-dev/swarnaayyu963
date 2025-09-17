import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/context/LanguageContext';
import { ThemedText } from '@/components/ThemedText';
import * as SecureStore from 'expo-secure-store';

export default function EditProfileScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Prefer not to say'>('Male');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        Alert.alert(t('error'), t('no_auth_token_login_again'));
        setLoading(false);
        return;
      }
      const response = await fetch('https://bot.swarnaayu.com/user/update_profile/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: name,
          age: Number(age),
          gender: gender.toLowerCase(),
        }),
      });
      if (response.ok) {
        Alert.alert(t('success'), t('profile_updated_successfully'), [
          { text: t('ok'), onPress: () => router.back() },
        ]);
      } else {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert(t('error'), errorData.detail || t('failed_update_profile'));
      }
    } catch (err) {
      Alert.alert(t('error'), t('error_occurred_try_again'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Fixed Header with proper navbar structure */}
      <View style={styles.header}>
        {/* Left: Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack && router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          accessibilityLabel={t('back_button')}
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>

        {/* Center: Title */}
        <ThemedText type="title" style={styles.headerTitle}>
          {t('edit_profile')}
        </ThemedText>

        {/* Right: Placeholder */}
        <View style={styles.rightPlaceholder} />
      </View>

      {/* Form */}
      <View style={styles.form}>
        <ThemedText style={styles.label}>{t('name')}</ThemedText>
        <TextInput
          style={styles.input}
          placeholder={t('name')}
          placeholderTextColor="#b3aefc"
          value={name}
          onChangeText={setName}
        />

        <ThemedText style={[styles.label, { marginTop: 24 }]}>{t('age')}</ThemedText>
        <TextInput
          style={styles.input}
          placeholder={t('age')}
          placeholderTextColor="#b3aefc"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />

        <ThemedText style={[styles.label, { marginTop: 24 }]}>{t('gender')}</ThemedText>
        <View style={styles.genderRow}>
          {['Male', 'Female', 'Prefer not to say'].map((g) => (
            <TouchableOpacity
              key={g}
              style={styles.genderOption}
              onPress={() => setGender(g as 'Male' | 'Female' | 'Prefer not to say')}
            >
              <View style={[styles.radio, gender === g && styles.radioSelected]}>
                {gender === g && <View style={styles.radioDot} />}
              </View>
              <ThemedText style={styles.genderLabel}>
                {g === 'Male' ? t('male') :
                 g === 'Female' ? t('female') :
                 t('prefer_not_to_say')}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.saveButtonText}>{t('save')}</ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Reused header style logic from MyPrivacyScreen
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    lineHeight: 36,
    paddingVertical: 8,
    paddingTop: 5,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  rightPlaceholder: {
    width: 44,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#a99af7',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#fff',
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 28,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#6c63ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioSelected: {
    borderColor: '#6c63ff',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6c63ff',
  },
  genderLabel: {
    fontSize: 14,
    color: '#222',
  },
  saveButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,         
    includeFontPadding: false, 
    textAlignVertical: 'center', 
    paddingTop: 4,          
  },
});
