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
import { setUserCountry, getUserCountry } from '@/utils/country';
import Constants from 'expo-constants';

// Define types based on context assumptions
type Language = 'English' | 'Hindi';
type TextSizeType = 'Small' | 'Medium' | 'Large';
type Accent = 'indian' | 'US';
type CulturalPreference = 'indian' | 'US';

// Define language mapping between API codes and context values
const languageMap: Record<string, Language> = {
  en: 'English',
  hi: 'Hindi',
};

const reverseLanguageMap: Record<Language, string> = {
  English: 'en',
  Hindi: 'hi',
};

// Define text size mapping between API and context values
const textSizeMap: Record<string, TextSizeType> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
};

const reverseTextSizeMap: Record<TextSizeType, string> = {
  Small: 'small',
  Medium: 'medium',
  Large: 'large',
};

// Define accent and cultural preference mappings (identity mappings since API and context values are the same)
const accentMap: Record<string, Accent> = {
  indian: 'indian',
  US: 'US',
};

const reverseAccentMap: Record<Accent, string> = {
  indian: 'indian',
  US: 'US',
};

const culturalPreferenceMap: Record<string, CulturalPreference> = {
  indian: 'indian',
  US: 'US',
};

const reverseCulturalPreferenceMap: Record<CulturalPreference, string> = {
  indian: 'indian',
  US: 'US',
};

export default function SettingsScreen() {
  const [handsFree, setHandsFree] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const { siginout } = useAuth();
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const { textSize, setTextSize, getFontSize } = useTextSize();
  const { t, setLanguage, language } = useLanguage();
  const router = useRouter();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [timezoneModalVisible, setTimezoneModalVisible] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [accentModalVisible, setAccentModalVisible] = useState(false);
  const [culturalPreferenceModalVisible, setCulturalPreferenceModalVisible] = useState(false);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [country, setCountry] = useState<string>('India');
  const [accent, setAccent] = useState<Accent>('indian');
  const [culturalPreference, setCulturalPreference] = useState<CulturalPreference>('indian');

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
    { label: t('English'), value: 'en', contextValue: 'English' as Language },
    { label: t('Hindi'), value: 'hi', contextValue: 'Hindi' as Language },
  ];

  const countryOptions = [
    { label: t('India'), value: 'India' },
    { label: t('US'), value: 'US' },
  ];

  const accentOptions = [
    { label: t('indian'), value: 'indian' as Accent },
    { label: t('US'), value: 'US' as Accent },
  ];

  const culturalPreferenceOptions = [
    { label: t('indian'), value: 'indian' as CulturalPreference },
    { label: t('US'), value: 'US' as CulturalPreference },
  ];

  const countryCodeToTimezone: Record<string, string> = {
    '91': 'Asia/Kolkata', // India
    '1': 'America/New_York', // USA
    '44': 'Europe/London', // UK
    '61': 'Australia/Sydney', // Australia
    '81': 'Asia/Tokyo', // Japan
    '49': 'Europe/Berlin', // Germany
    '55': 'America/Sao_Paulo', // Brazil
  };

  const getPhone = async () => {
    try {
      const phoneNumber = await SecureStore.getItemAsync('phone_number');
      if (phoneNumber) {
        setPhoneNumber(phoneNumber);
        const code = phoneNumber.startsWith('+') ? phoneNumber.slice(1, 3) : phoneNumber.slice(0, 2);
        const tz = countryCodeToTimezone[code];
        if (tz) setTimezone(tz);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load phone number.');
    }
  };

  const fetchSettings = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found.');
        return;
      }

      const response = await fetch('https://bot.swarnaayu.com/user/settings/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      console.log('API settings:', data); // Debugging

      // Validate and set language
      const languageValue = data.language && languageMap[data.language] ? languageMap[data.language] : 'English';
      setLanguage(languageValue);

      // Validate and set text size
      const textSizeValue = data.font_size && textSizeMap[data.font_size.toLowerCase()] ? textSizeMap[data.font_size.toLowerCase()] : 'Medium';
      setTextSize(textSizeValue);
      await SecureStore.setItemAsync('text_size', textSizeValue);

      // Validate and set accent
      const accentValue = data.accent && accentMap[data.accent] ? accentMap[data.accent] : 'indian';
      setAccent(accentValue);
      await SecureStore.setItemAsync('accent', accentValue);

      // Validate and set cultural preference
      const culturalPreferenceValue = data.cultural_preference && culturalPreferenceMap[data.cultural_preference] ? culturalPreferenceMap[data.cultural_preference] : 'indian';
      setCulturalPreference(culturalPreferenceValue);
      await SecureStore.setItemAsync('cultural_preference', culturalPreferenceValue);

      setTimezone(data.time_zone || 'Asia/Kolkata');
      setCountry(data.country || 'India');
    } catch (error) {
      Alert.alert('Error', 'Failed to load settings from server.');
      // Fallback to stored values
      const storedTextSize = await SecureStore.getItemAsync('text_size');
      if (storedTextSize && ['Small', 'Medium', 'Large'].includes(storedTextSize)) {
        setTextSize(storedTextSize as TextSizeType);
      }
      const storedAccent = await SecureStore.getItemAsync('accent');
      if (storedAccent && ['indian', 'US'].includes(storedAccent)) {
        setAccent(storedAccent as Accent);
      }
      const storedCulturalPreference = await SecureStore.getItemAsync('cultural_preference');
      if (storedCulturalPreference && ['indian', 'US'].includes(storedCulturalPreference)) {
        setCulturalPreference(storedCulturalPreference as CulturalPreference);
      }
    }
  };

  const saveSettings = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found.');
        return;
      }

      const payload = {
        language: reverseLanguageMap[language] || 'en',
        font_size: reverseTextSizeMap[textSize] || 'medium',
        accent: reverseAccentMap[accent] || 'indian',
        cultural_preference: reverseCulturalPreferenceMap[culturalPreference] || 'indian',
        time_zone: timezone,
        country,
      };

      const response = await fetch('https://bot.swarnaayu.com/user/settings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      // Store the updated settings locally
      await SecureStore.setItemAsync('user_country', country);
      await SecureStore.setItemAsync('text_size', textSize);
      await SecureStore.setItemAsync('accent', accent);
      
      // Store the cultural preference with the API format (not the display format)
      const apiCulturalPreference = reverseCulturalPreferenceMap[culturalPreference] || 'indian';
      await SecureStore.setItemAsync('cultural_preference', apiCulturalPreference);
      
      // Set a flag to indicate settings were just updated to prevent unnecessary API calls
      await SecureStore.setItemAsync('settings_just_updated', 'true');
      await SecureStore.setItemAsync('settings_update_timestamp', Date.now().toString());
      
      Alert.alert('Success', 'Settings saved successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings.');
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        // Load stored values as fallback
        const storedTextSize = await SecureStore.getItemAsync('text_size');
        if (storedTextSize && ['Small', 'Medium', 'Large'].includes(storedTextSize)) {
          setTextSize(storedTextSize as TextSizeType);
        }
        const storedAccent = await SecureStore.getItemAsync('accent');
        if (storedAccent && ['indian', 'US'].includes(storedAccent)) {
          setAccent(storedAccent as Accent);
        }
        const storedCulturalPreference = await SecureStore.getItemAsync('cultural_preference');
        if (storedCulturalPreference && ['indian', 'US'].includes(storedCulturalPreference)) {
          setCulturalPreference(storedCulturalPreference as CulturalPreference);
        }

        await Promise.all([getPhone(), fetchSettings()]);
        const storedCountry = await SecureStore.getItemAsync('user_country');
        if (storedCountry) setCountry(storedCountry);
        else await SecureStore.setItemAsync('user_country', 'India');
      } catch (error) {
        Alert.alert('Error', 'Failed to initialize settings.');
      }
    };
    init();
  }, []);

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          siginout();
        },
      },
    ]);
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
    const useRightArrow = [t('edit_profile'), t('my_privacy'), t('about_aayu'), t('help_center')].includes(label);
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
      <View style={styles.navbar}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack && router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          style={{ padding: 8 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <ThemedText style={styles.navbarTitle}>{t('settings')}</ThemedText>
        <TouchableOpacity
          onPress={saveSettings}
          style={{ padding: 8 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Save settings"
        >
          <ThemedText style={{ fontSize: getFontSize(), color: '#6c63ff', fontWeight: '600' }}>
            {t('save')}
          </ThemedText>
        </TouchableOpacity>
      </View>
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
              style={[styles.modalOption, language === lang.contextValue && styles.modalOptionSelected]}
              onPress={() => {
                setLanguage(lang.contextValue);
                setLanguageModalVisible(false);
              }}
            >
              <ThemedText
                style={[dynamicStyles.modalOptionText, language === lang.contextValue && dynamicStyles.modalOptionTextSelected]}
              >
                {lang.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
      <Modal
        visible={countryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setCountryModalVisible(false)} />
        <View style={styles.modalContent}>
          <ThemedText style={[styles.modalTitle, { fontSize: getFontSize() + 2 }]}>{t('country')}</ThemedText>
          {countryOptions.map((c) => (
            <TouchableOpacity
              key={c.value}
              style={[styles.modalOption, country === c.value && styles.modalOptionSelected]}
              onPress={() => {
                setCountry(c.value as 'India' | 'US');
                setCountryModalVisible(false);
                // Update timezone based on country
                const newTimezone = c.value === 'India' ? 'Asia/Kolkata' : 'America/New_York';
                setTimezone(newTimezone);
              }}
            >
              <ThemedText
                style={[dynamicStyles.modalOptionText, country === c.value && dynamicStyles.modalOptionTextSelected]}
              >
                {c.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
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
              <ThemedText
                style={[dynamicStyles.modalOptionText, timezone === tz.value && dynamicStyles.modalOptionTextSelected]}
              >
                {t(tz.label.toLowerCase())}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
      <Modal
        visible={accentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAccentModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setAccentModalVisible(false)} />
        <View style={styles.modalContent}>
          <ThemedText style={[styles.modalTitle, { fontSize: getFontSize() + 2 }]}>{t('accent')}</ThemedText>
          {accentOptions.map((acc) => (
            <TouchableOpacity
              key={acc.value}
              style={[styles.modalOption, accent === acc.value && styles.modalOptionSelected]}
              onPress={() => {
                setAccent(acc.value);
                setAccentModalVisible(false);
              }}
            >
              <ThemedText
                style={[dynamicStyles.modalOptionText, accent === acc.value && dynamicStyles.modalOptionTextSelected]}
              >
                {acc.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
      <Modal
        visible={culturalPreferenceModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCulturalPreferenceModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setCulturalPreferenceModalVisible(false)} />
        <View style={styles.modalContent}>
          <ThemedText style={[styles.modalTitle, { fontSize: getFontSize() + 2 }]}>{t('cultural_preference')}</ThemedText>
          {culturalPreferenceOptions.map((cp) => (
            <TouchableOpacity
              key={cp.value}
              style={[styles.modalOption, culturalPreference === cp.value && styles.modalOptionSelected]}
              onPress={() => {
                setCulturalPreference(cp.value);
                setCulturalPreferenceModalVisible(false);
              }}
            >
              <ThemedText
                style={[dynamicStyles.modalOptionText, culturalPreference === cp.value && dynamicStyles.modalOptionTextSelected]}
              >
                {cp.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
      <ScrollView style={styles.container}>
        <ThemedText type="title" style={[styles.sectionTitleMain, { fontSize: getFontSize() + 4 }]}>
          {t('account')}
        </ThemedText>
        <SettingRow label={t('whatsapp_number')} value={`${phoneNumber ||'loading...'}`} hasArrow={false} />
        <SettingRow label={t('edit_profile')} onPress={() => router.push('/edit-profile')} hasArrow />
        <SettingRow label={t('my_privacy')} onPress={() => router.push('/my-privacy')} hasArrow />
        <ThemedText type="title" style={[styles.sectionTitleMain, { fontSize: getFontSize() + 4 }]}>
          {t('voice_audio')}
        </ThemedText>
        <SettingRow label={t('microphone_access')} value={t('allowed')} hasArrow={false} />
        <SettingRow
          label={t('accent')}
          value={t(accent)}
          onPress={() => setAccentModalVisible(true)}
          hasArrow
        />
        <ThemedText type="title" style={[styles.sectionTitleMain, { fontSize: getFontSize() + 4 }]}>
          {t('language')}
        </ThemedText>
        <SettingRow
          label={t('main_language')}
          value={t(language)}
          onPress={() => setLanguageModalVisible(true)}
          hasArrow
        />
        {expanded['Main Language'] && (
          <View style={styles.expandedContent}>
            <ThemedText style={styles.expandedText}>Language selection coming soon.</ThemedText>
          </View>
        )}
        <ThemedText type="title" style={[styles.sectionTitleMain, { fontSize: getFontSize() + 4 }]}>
          {t('country')}
        </ThemedText>
        <SettingRow
          label={t('country')}
          value={t(country)}
          onPress={() => setCountryModalVisible(true)}
          hasArrow
        />
        {expanded['Country'] && (
          <View style={styles.expandedContent}>
            <ThemedText style={styles.expandedText}>Country selection coming soon.</ThemedText>
          </View>
        )}
        <ThemedText type="title" style={[styles.sectionTitleMain, { fontSize: getFontSize() + 4 }]}>
          {t('cultural_preference')}
        </ThemedText>
        <SettingRow
          label={t('cultural_preference')}
          value={t(culturalPreference)}
          onPress={() => setCulturalPreferenceModalVisible(true)}
          hasArrow
        />
        <ThemedText type="title" style={[styles.sectionTitleMain, { fontSize: getFontSize() + 4 }]}>
          {t('text_size')}
        </ThemedText>
        <View style={styles.textSizeRow}>
          {(['Small', 'Medium', 'Large'] as TextSizeType[]).map((size) => (
            <TouchableOpacity
              key={size}
              style={[styles.textSizeButton, textSize === size && styles.textSizeButtonActive]}
              onPress={() => {
                setTextSize(size);
                console.log(`Text size set to: ${size}`); // Debugging
              }}
            >
              <ThemedText
                style={[styles.textSizeButtonText, textSize === size && styles.textSizeButtonTextActive, { fontSize: getFontSize() }]}
              >
                {t(size.toLowerCase())}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        <ThemedText type="title" style={[styles.sectionTitleMain, { fontSize: getFontSize() + 4 }]}>
          {t('timezone')}
        </ThemedText>
        <SettingRow
          label={t('current_timezone')}
          value={timezoneOptions.find((tz) => tz.value === timezone)?.label || timezone}
          onPress={() => setTimezoneModalVisible(true)}
          hasArrow
        />
        {expanded['Timezone'] && (
          <View style={styles.expandedContent}>
            <ThemedText style={styles.expandedText}>Timezone selection coming soon.</ThemedText>
          </View>
        )}
        <ThemedText type="title" style={[styles.sectionTitleMain, { fontSize: getFontSize() + 4 }]}>
          {t('support')}
        </ThemedText>
        <SettingRow label={t('help_center')} onPress={() => router.push('/help-center')} hasArrow />
        <SettingRow label={t('about_aayu')} onPress={() => router.push('/about-aayu')} hasArrow />
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
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
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
  },
  navbarTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    flex: 1,
    marginLeft: -28, // visually center with back arrow
  },
  sectionTitleMain: {
    marginTop: 20,
    marginBottom: 0,
    fontWeight: '700',
    color: '#111',
    textAlign: 'left',
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
    paddingVertical: 18,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    paddingHorizontal: 0,
  },
  left: {
    marginRight: 12,
  },
  middle: {
    flex: 1,
  },
  label: {
    color: '#222',
    fontWeight: '500',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    color: '#6c63ff',
    fontSize: 16,
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
    marginVertical: 18,
    marginHorizontal: 0,
    gap: 10,
  },
  textSizeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f2fa',
    marginHorizontal: 0,
    alignItems: 'center',
  },
  textSizeButtonActive: {
    backgroundColor: '#564CF3',
    borderWidth: 0,
  },
  textSizeButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  textSizeButtonTextActive: {
    color: '#fff',
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