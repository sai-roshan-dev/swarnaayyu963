import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/context/LanguageContext';
import { ThemedText } from '@/components/ThemedText';

export default function EditProfileScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Others'>('Male');

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>{t('edit_profile')}</ThemedText>
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
          {[t('male'), t('female'), t('others')].map((g, idx) => (
            <TouchableOpacity
              key={g}
              style={styles.genderOption}
              onPress={() => setGender(['Male', 'Female', 'Others'][idx] as 'Male' | 'Female' | 'Others')}
            >
              <View style={[styles.radio, gender === ['Male', 'Female', 'Others'][idx] && styles.radioSelected]}>
                {gender === ['Male', 'Female', 'Others'][idx] && <View style={styles.radioDot} />}
              </View>
              <ThemedText style={styles.genderLabel}>{g}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.saveButton}>
          <ThemedText style={styles.saveButtonText}>{t('save')}</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
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
    fontSize: 16,
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