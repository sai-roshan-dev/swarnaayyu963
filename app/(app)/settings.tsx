import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { useTextSize } from '@/context/TextSettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { ThemedText } from '@/components/ThemedText';


export default function SettingsScreen() {
  const [handsFree, setHandsFree] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const {siginout} = useAuth()
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const { textSize, setTextSize, getFontSize } = useTextSize();
  const { t, setLanguage, language } = useLanguage();
  const router = useRouter();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [timezoneModalVisible, setTimezoneModalVisible] = useState(false);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const timezoneOptions = [
    { label: 'India (Asia/Kolkata)', value: 'Asia/Kolkata' },
    { label: 'USA (America/New_York)', value: 'America/New_York' },
    { label: 'UK (Europe/London)', value: 'Europe/London' },
    { label: 'Australia (Australia/Sydney)', value: 'Australia/Sydney' },
    { label: 'Japan (Asia/Tokyo)', value: 'Asia/Tokyo' },
    { label: 'Germany (Europe/Berlin)', value: 'Europe/Berlin' },
    { label: 'Brazil (America/Sao_Paulo)', value: 'America/Sao_Paulo' },
  ];
  const languageOptions = [
    { label: t('English'), value: 'English' },
    { label: t('Hindi'), value: 'Hindi' },
  ];

  const countryCodeToTimezone: Record<string, string> = {
    '91': 'Asia/Kolkata',         // India
    '1': 'America/New_York',      // USA (default to NY)
    '44': 'Europe/London',        // UK
    '61': 'Australia/Sydney',     // Australia
    '81': 'Asia/Tokyo',           // Japan
    '49': 'Europe/Berlin',        // Germany
    '55': 'America/Sao_Paulo',    // Brazil
    // Add more as needed
  };

  const getPhone = async () => {
    const phoneNumber = await SecureStore.getItemAsync('phone_number');
    if (phoneNumber) {
      setPhoneNumber(phoneNumber);
      // Extract country code (assuming phoneNumber is like '919876543210')
      const code = phoneNumber.startsWith('+') ? phoneNumber.slice(1, 3) : phoneNumber.slice(0, 2);
      const tz = countryCodeToTimezone[code];
      if (tz) setTimezone(tz);
    }
  };

  useEffect(() =>{
    getPhone()
  }, [])

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => { siginout()
         },
      },
    ]);
    console.log('after login redirect')
  };

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const SettingRow = ({
    label,
    value,
    onPress,
    hasArrow = true,
    isToggle = false,
    toggleValue,
    onToggle,
    icon,
    expandedContent,
  }: {
    label: string;
    value?: string;
    onPress?: () => void;
    hasArrow?: boolean;
    isToggle?: boolean;
    toggleValue?: boolean;
    onToggle?: () => void;
    icon?: React.ReactNode;
    expandedContent?: React.ReactNode;
  }) => {
    // Use right arrow for Edit Profile, My Privacy, About Aayu
    const useRightArrow = [t('edit_profile'), t('my_privacy'), t('about_aayu')].includes(label);
    return (
      <>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={onPress ? 0.6 : 1}
          style={styles.row}
        >
          <View style={styles.left}>{icon}</View>
          <View style={styles.middle}>
            <ThemedText style={[styles.label, { fontSize: getFontSize() }]}>{label}</ThemedText>
          </View>
          {isToggle ? (
            <Switch value={toggleValue} onValueChange={onToggle} />
          ) : (
            <View style={styles.right}>
              {value && <ThemedText style={[styles.value, { fontSize: getFontSize() }]}>{value}</ThemedText>}
              {hasArrow && (
                <Ionicons
                  name={useRightArrow ? 'chevron-forward' : 'chevron-down'}
                  size={20}
                  color="#6c63ff"
                  style={useRightArrow ? undefined : { transform: [{ rotate: expanded[label] ? '180deg' : '0deg' }] }}
                />
              )}
            </View>
          )}
        </TouchableOpacity>
        {expandedContent && expanded[label] && (
          <View style={styles.expandedContent}>{expandedContent}</View>
        )}
      </>
    );
  };

  const dynamicStyles = {
    label: {
      fontSize: getFontSize(),
      color: '#333',
    },
    value: {
      fontSize: getFontSize() - 2,
      color: '#6c63ff',
    },
    modalTitle: {
      fontSize: getFontSize() + 2,
      fontWeight: '700' as const,
      marginBottom: 16,
      color: '#222',
      textAlign: 'center' as const,
    },
    modalOptionText: {
      fontSize: getFontSize(),
      color: '#222',
      textAlign: 'center' as const,
    },
    modalOptionTextSelected: {
      color: '#6c63ff',
      fontWeight: '700' as const,
    },
  };

  return (
   <>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.push('/')}> 
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <ThemedText style={styles.navbarTitle}>{t('settings')}</ThemedText>
        <View style={{ width: 28 }} />
      </View>
      {/* Language Modal */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLanguageModalVisible(false)} />
        <View style={styles.modalContent}>
          <ThemedText style={[styles.modalTitle, { fontSize: getFontSize() + 2 }]}>{t('main_language')}</ThemedText>
          {languageOptions.map((lang) => (
            <TouchableOpacity
              key={lang.value}
              style={[styles.modalOption, language === lang.value && styles.modalOptionSelected]}
              onPress={() => {
                setLanguage(lang.value as 'English' | 'Hindi');
                setLanguageModalVisible(false);
              }}
            >
              <ThemedText style={[dynamicStyles.modalOptionText, language === lang.value && dynamicStyles.modalOptionTextSelected]}>{lang.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
      {/* Timezone Modal */}
      <Modal
        visible={timezoneModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTimezoneModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setTimezoneModalVisible(false)} />
        <View style={styles.modalContent}>
          <ThemedText style={[styles.modalTitle, { fontSize: getFontSize() + 2 }]}>{t('timezone')}</ThemedText>
          {timezoneOptions.map((tz) => (
            <TouchableOpacity
              key={tz.value}
              style={[styles.modalOption, timezone === tz.value && styles.modalOptionSelected]}
              onPress={() => {
                setTimezone(tz.value);
                setTimezoneModalVisible(false);
              }}
            >
              <ThemedText style={[dynamicStyles.modalOptionText, timezone === tz.value && dynamicStyles.modalOptionTextSelected]}>{tz.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
      <ScrollView style={styles.container}>
        {/* Account Section */}
        <ThemedText type="title" style={styles.sectionTitleMain}>{t('account')}</ThemedText>
        <SettingRow
          label={t('whatsapp_number')}
          value={`${phoneNumber || '+91 91234 56789'}`}
          hasArrow={false}
        />
        <SettingRow
          label={t('edit_profile')}
          onPress={() => router.push('/edit-profile')}
          hasArrow
        />
        <SettingRow
          label={t('my_privacy')}
          onPress={() => router.push('/my-privacy')}
          hasArrow
        />

        {/* Voice & Audio Section */}
        <ThemedText type="title" style={styles.sectionTitleMain}>{t('voice_audio')}</ThemedText>
        <SettingRow label={t('microphone_access')} value={t('allowed')} hasArrow={false} />

        {/* Languages Section */}
        <ThemedText type="title" style={styles.sectionTitleMain}>{t('language')}</ThemedText>
        <SettingRow label={t('main_language')} value={t(language)} onPress={() => setLanguageModalVisible(true)} hasArrow />
        {expanded['Main Language'] && (
          <View style={styles.expandedContent}><ThemedText style={styles.expandedText}>Language selection coming soon.</ThemedText></View>
        )}

        {/* Text Size Section */}
        <ThemedText type="title" style={styles.sectionTitleMain}>{t('text_size')}</ThemedText>
        <View style={styles.textSizeRow}>
          {['Small', 'Medium', 'Large'].map((size) => (
            <TouchableOpacity
              key={size}
              style={[styles.textSizeButton, textSize === size && styles.textSizeButtonActive]}
              onPress={() => setTextSize(size as 'Small' | 'Medium' | 'Large')}
            >
              <ThemedText style={[
                styles.textSizeButtonText,
                textSize === size && styles.textSizeButtonTextActive,
                size === 'Small' && { fontSize: 14 },
                size === 'Medium' && { fontSize: 18 },
                size === 'Large' && { fontSize: 22 },
              ]}>{t(size.toLowerCase())}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Timezone Section */}
        <ThemedText type="title" style={styles.sectionTitleMain}>{t('timezone')}</ThemedText>
        <SettingRow label={t('current_timezone')} value={timezoneOptions.find(tz => tz.value === timezone)?.label || timezone} onPress={() => setTimezoneModalVisible(true)} hasArrow />
        {expanded['Timezone'] && (
          <View style={styles.expandedContent}><ThemedText style={styles.expandedText}>Timezone selection coming soon.</ThemedText></View>
        )}

        {/* Support Section */}
        <ThemedText type="title" style={styles.sectionTitleMain}>{t('support')}</ThemedText>
        <SettingRow
          label={t('help_center')}
          icon={<FontAwesome name="whatsapp" size={18} color="#25D366" />}
          onPress={() => toggleExpand('Help Center')}
          hasArrow
          expandedContent={<ThemedText style={styles.expandedText}>Contact us on WhatsApp for help.</ThemedText>}
        />
        <SettingRow
          label={t('about_aayu')}
          onPress={() => router.push('/about-aayu')}
          hasArrow
        />

        {/* Logout Button */}
        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#e53935" />
          <ThemedText style={styles.logoutText}>{t('logout')}</ThemedText>
        </TouchableOpacity>
      </ScrollView>
      </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
  navbar: {
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
  navbarTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
  },
  sectionTitleMain: {
    marginTop: 28,
    marginBottom: 8,
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  left: {
    marginRight: 12,
  },
  middle: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    color: '#6c63ff',
    fontSize: 15,
    marginRight: 4,
    fontWeight: '500',
  },
  expandedContent: {
    backgroundColor: '#f7f7f7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    marginLeft: 8,
  },
  expandedText: {
    color: '#444',
    fontSize: 14,
  },
  textSizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
    marginHorizontal: 8,
  },
  textSizeButton: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    backgroundColor: '#f3f2fa',
    marginHorizontal: 2,
  },
  textSizeButtonActive: {
    backgroundColor: '#ece8ff',
    borderWidth: 1,
    borderColor: '#6c63ff',
  },
  textSizeButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  textSizeButtonTextActive: {
    color: '#6c63ff',
    fontWeight: '700',
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 32,
    justifyContent: 'center',
  },
  logoutText: {
    color: '#e53935',
    fontWeight: '700',
    fontSize: 20,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#222',
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f3f2fa',
  },
  modalOptionSelected: {
    backgroundColor: '#ece8ff',
    borderWidth: 1,
    borderColor: '#6c63ff',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#222',
    textAlign: 'center',
  },
  modalOptionTextSelected: {
    color: '#6c63ff',
    fontWeight: '700',
  },
});
