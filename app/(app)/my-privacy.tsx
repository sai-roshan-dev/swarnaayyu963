import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/context/LanguageContext';
import { ThemedText } from '@/components/ThemedText';

export default function MyPrivacyScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>{t('my_privacy')}</ThemedText>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop:5, padding: 20, paddingBottom: 40 }}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>{t('data_sharing_protection')}</ThemedText>
        <View style={styles.bulletList}>
          <ThemedText style={styles.bulletItem}>{'\u2022'} {t('no_sell_data')}</ThemedText>
          <ThemedText style={styles.bulletItem}>{'\u2022'} {t('share_with_trusted')}</ThemedText>
          <ThemedText style={styles.bulletItem}>{'\u2022'} {t('encryption_security')}</ThemedText>
        </View>
        <ThemedText type="subtitle" style={styles.sectionTitle}>{t('rights_choices')}</ThemedText>
        <View style={styles.bulletList}>
          <ThemedText style={styles.bulletItem}>{'\u2022'} {t('access_update_delete')}</ThemedText>
          <ThemedText style={styles.bulletItem}>{'\u2022'} {t('opt_out_data')}</ThemedText>
        </View>
        <ThemedText type="subtitle" style={styles.sectionTitle}>{t('changes_policy')}</ThemedText>
        <ThemedText style={styles.paragraph}>{t('policy_update_note')}</ThemedText>
        <ThemedText type="subtitle" style={styles.sectionTitle}>{t('contact_us')}</ThemedText>
        <ThemedText style={styles.paragraph}>
          {t('policy_questions')} <ThemedText style={styles.link} onPress={() => Linking.openURL('mailto:team@Aayu.com')}>team@Aayu.com</ThemedText>
        </ThemedText>
        <TouchableOpacity style={styles.deleteButton}>
          <MaterialIcons name="delete" size={24} color="#e53935" />
          <ThemedText style={styles.deleteButtonText}>{t('delete_account')}</ThemedText>
        </TouchableOpacity>
      </ScrollView>
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
  content: {
    padding: 20,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginTop: 18,
    marginBottom: 8,
  },
  bulletList: {
    marginLeft: 8,
    marginBottom: 8,
  },
  bulletItem: {
    fontSize: 16,
    color: '#222',
    marginBottom: 4,
    marginLeft: 8,
  },
  paragraph: {
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
    marginLeft: 2,
  },
  link: {
    color: '#6c63ff',
    textDecorationLine: 'underline',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e53935',
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    marginTop: 32,
  },
  deleteButtonText: {
    color: '#e53935',
    fontWeight: '700',
    fontSize: 20,
    marginLeft: 10,
  },
}); 