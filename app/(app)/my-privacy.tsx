import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Linking, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/context/LanguageContext';
import { ThemedText } from '@/components/ThemedText';
import * as SecureStore from 'expo-secure-store';

export default function MyPrivacyScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (isDeleting) return;

    let authToken;
    try {
      authToken = await SecureStore.getItemAsync('token');
      if (!authToken) {
        Alert.alert(
          t('error'),
          t('no_auth_token'),
          [{ text: t('ok'), onPress: () => router.push('/login') }],
          { cancelable: false }
        );
        return;
      }
    } catch (error) {
      Alert.alert(t('error'), t('secure_store_error'));
      console.error('SecureStore error:', error);
      return;
    }

    Alert.alert(
      t('confirm_delete_title'),
      t('confirm_delete_message'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const response = await fetch('https://bot.swarnaayu.com/user/settings/', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Token ${authToken}`,
                },
                body: JSON.stringify({ confirm: true }),
              });

              if (response.ok) {
                await SecureStore.deleteItemAsync('token');
                let successMsg = t('account_deleted_success');
                try {
                  const data = await response.json();
                  if (data && data.message) successMsg = data.message;
                } catch (e) {}
                Alert.alert(
                  t('success'),
                  successMsg,
                  [{ text: t('ok'), onPress: () => router.replace('/login') }],
                  { cancelable: false }
                );
              } else {
                let errorMsg = t('delete_account_failed');
                try {
                  const errorData = await response.json();
                  if (errorData && errorData.message) errorMsg = errorData.message;
                } catch (e) {}
                Alert.alert(t('error'), errorMsg);
              }
            } catch (error) {
              Alert.alert(t('error'), t('network_error'));
              console.error('Delete account error:', error);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

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
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel={t('back_button')}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>{t('my_privacy')}</ThemedText>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
       
        <ThemedText style={styles.paragraph}>{t('welcome_intro')}</ThemedText>

        <ThemedText type="subtitle" style={styles.sectionTitle}>{t('info_we_collect')}</ThemedText>
        <View style={styles.bulletList}>
          <ThemedText style={styles.bulletItem}>
            {'\u2022'} <ThemedText style={styles.boldText}>{t('personal_info')}:</ThemedText> {t('personal_info_desc')}
          </ThemedText>
          <ThemedText style={styles.bulletItem}>
            {'\u2022'} <ThemedText style={styles.boldText}>{t('usage_data')}:</ThemedText> {t('usage_data_desc')}
          </ThemedText>
          <ThemedText style={styles.bulletItem}>
            {'\u2022'} <ThemedText style={styles.boldText}>{t('third_party_data')}:</ThemedText> {t('third_party_data_desc')}
          </ThemedText>
        </View>

        <ThemedText type="subtitle" style={styles.sectionTitle}>{t('how_we_use_info')}</ThemedText>
        <View style={styles.bulletList}>
          <ThemedText style={styles.bulletItem}>{'\u2022'} {t('provide_personalize_app')}</ThemedText>
          <ThemedText style={styles.bulletItem}>{'\u2022'} {t('help_reminders_conversations')}</ThemedText>
          <ThemedText style={styles.bulletItem}>{'\u2022'} {t('support_secure_experience')}</ThemedText>
          <ThemedText style={styles.bulletItem}>{'\u2022'} {t('analyze_usage_patterns')}</ThemedText>
        </View>

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
          {t('policy_questions')}{' '}
          <ThemedText
            style={styles.link}
            onPress={handleEmailLink}
            accessibilityLabel={t('contact_email')}
            accessibilityRole="link"
          >
            contact@swarnaayu.com
          </ThemedText>
        </ThemedText>

        <ThemedText style={styles.lastUpdated}>{t('last_updated')}</ThemedText>

        <TouchableOpacity
          style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
          onPress={handleDeleteAccount}
          disabled={isDeleting}
          accessibilityLabel={t('delete_account')}
          accessibilityRole="button"
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#e53935" />
          ) : (
            <MaterialIcons name="delete" size={24} color="#e53935" />
          )}
          <ThemedText style={styles.deleteButtonText}>{t('delete_account')}</ThemedText>
        </TouchableOpacity>
      </ScrollView>
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
    paddingTop: 10,
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
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginTop: 20,
    marginBottom: 12,
  },
  bulletList: {
    marginLeft: 8,
    marginBottom: 12,
  },
  bulletItem: {
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
    marginLeft: 8,
    textAlign: 'left',
    lineHeight: 24,
  },
  boldText: {
    fontWeight: '600',
    color: '#000',
  },
  paragraph: {
    fontSize: 16,
    color: '#222',
    marginBottom: 12,
    marginLeft: 2,
    lineHeight: 24,
  },
  link: {
    color: '#6c63ff',
    textDecorationLine: 'underline',
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
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
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: '#e53935',
    fontWeight: '700',
    fontSize: 20,
    marginLeft: 10,
  },
});