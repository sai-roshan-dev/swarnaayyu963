import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
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
        Alert.alert('Error', 'No auth token found. Please log in again.');
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
        // // Update SecureStore with new details
        // await SecureStore.setItemAsync('name', name);
        // await SecureStore.setItemAsync('age', age);
        // await SecureStore.setItemAsync('gender', gender);
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert('Error', errorData.detail || 'Failed to update profile.');
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={{ padding: 10, zIndex: 100, pointerEvents: 'auto' }}
          onPress={() => {
            console.log('Back arrow pressed');
            if (router.canGoBack && router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <ThemedText style={styles.navbarTitle}>{t('settings')}</ThemedText>
        <View style={{ width: 28 }} />
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
          {[t('Male'), t('Female'), t('Prefer not to say')].map((g, idx) => (
            <TouchableOpacity
              key={g}
              style={styles.genderOption}
              onPress={() => setGender(['Male', 'Female', 'Prefer not to say'][idx] as 'Male' | 'Female' | 'Prefer not to say')}
            >
              <View style={[styles.radio, gender === ['Male', 'Female', 'Prefer not to say'][idx] && styles.radioSelected]}>
                {gender === ['Male', 'Female', 'Prefer not to say'][idx] && <View style={styles.radioDot} />}
              </View>
              <ThemedText style={styles.genderLabel}>{g}</ThemedText>
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
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 18,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
    zIndex: 100, // add this
  },
  navbarTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
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
  },
}); 