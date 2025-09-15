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
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { useTextSize } from '@/context/TextSettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { ThemedText } from '@/components/ThemedText';
import { setUserCountry, getUserCountry } from '@/utils/country';

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

// Button text size values
const BUTTON_LABEL_FONT_SIZES: Record<TextSizeType, number> = {
  Small: 14,
  Medium: 16,
  Large: 18,
};

// Define accent and cultural preference mappings
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

// Enhanced timezone options with better formatting
const timezoneOptions = [
  { 
    label: 'India (IST)', 
    value: 'Asia/Kolkata', 
    tKey: 'india_asia_kolkata',
    offset: '+05:30',
    country: 'India'
  },
  { 
    label: 'USA Eastern (EST)', 
    value: 'America/New_York', 
    tKey: 'america_new_york',
    offset: '-05:00',
    country: 'US'
  },
  { 
    label: 'UK (GMT)', 
    value: 'Europe/London', 
    tKey: 'europe_london',
    offset: '+00:00',
    country: 'UK'
  },
  { 
    label: 'Australia (AEDT)', 
    value: 'Australia/Sydney', 
    tKey: 'australia_sydney',
    offset: '+11:00',
    country: 'Australia'
  },
  { 
    label: 'Japan (JST)', 
    value: 'Asia/Tokyo', 
    tKey: 'asia_tokyo',
    offset: '+09:00',
    country: 'Japan'
  },
  { 
    label: 'Germany (CET)', 
    value: 'Europe/Berlin', 
    tKey: 'europe_berlin',
    offset: '+01:00',
    country: 'Germany'
  },
  { 
    label: 'Brazil (BRT)', 
    value: 'America/Sao_Paulo', 
    tKey: 'america_sao_paulo',
    offset: '-03:00',
    country: 'Brazil'
  },
];

// Enhanced accent options with descriptions
const accentOptionsEnhanced = [
  { 
    label: 'Indian English', 
    value: 'indian' as Accent, 
    description: 'Clear Indian accent for natural conversation',
    tKey: 'indian'
  },
  { 
    label: 'American English', 
    value: 'US' as Accent, 
    description: 'Standard American pronunciation',
    tKey: 'us_accent'
  },
];

export default function SettingsScreen() {
  const [handsFree, setHandsFree] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { siginout } = useAuth();
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const { textSize, setTextSize, getFontSize } = useTextSize();
  const { t, setLanguage, language } = useLanguage();
  const router = useRouter();
  
  // Modal states
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [timezoneModalVisible, setTimezoneModalVisible] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [accentModalVisible, setAccentModalVisible] = useState(false);
  const [culturalPreferenceModalVisible, setCulturalPreferenceModalVisible] = useState(false);
  
  // Settings states
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [country, setCountry] = useState<string>('India');
  const [accent, setAccent] = useState<Accent>('indian');
  const [culturalPreference, setCulturalPreference] = useState<CulturalPreference>('indian');

  // Original values for change detection
  const [originalSettings, setOriginalSettings] = useState({
    language: 'English' as Language,
    textSize: 'Medium' as TextSizeType,
    accent: 'indian' as Accent,
    culturalPreference: 'indian' as CulturalPreference,
    timezone: 'Asia/Kolkata',
    country: 'India',
  });

  // Track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Function to check if settings have changed
  const checkForChanges = () => {
    const hasChanges = 
      language !== originalSettings.language ||
      textSize !== originalSettings.textSize ||
      accent !== originalSettings.accent ||
      culturalPreference !== originalSettings.culturalPreference ||
      timezone !== originalSettings.timezone ||
      country !== originalSettings.country;
    
    setHasUnsavedChanges(hasChanges);
    return hasChanges;
  };

  // Enhanced language options
  const languageOptions = [
    { label: t('english'), value: 'en', contextValue: 'English' as Language },
    { label: t('hindi'), value: 'hi', contextValue: 'Hindi' as Language },
  ];

  const countryOptions = [
    { label: t('india'), value: 'India' },
    { label: t('us_country'), value: 'US' },
  ];

  const accentOptions = [
    { label: t('indian'), value: 'indian' as Accent },
    { label: t('us_accent'), value: 'US' as Accent },
  ];

  const culturalPreferenceOptions = [
    { label: t('indian'), value: 'indian' as CulturalPreference },
    { label: t('us_accent'), value: 'US' as CulturalPreference },
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

  // Enhanced phone number loading with error handling
  const getPhone = async () => {
    try {
      const phoneNumber = await SecureStore.getItemAsync('phone_number');
      if (phoneNumber) {
        setPhoneNumber(phoneNumber);
        // Auto-detect timezone from phone number
        const code = phoneNumber.startsWith('+') ? phoneNumber.slice(1, 3) : phoneNumber.slice(0, 2);
        const tz = countryCodeToTimezone[code];
        if (tz && !timezone) { // Only set if timezone is not already set
          setTimezone(tz);
        }
      }
    } catch (error) {
      console.error('Error loading phone number:', error);
      Alert.alert(t('error'), t('failed_load_phone'), [{ text: t('ok') }]);
    }
  };

  // Enhanced settings fetching with better error handling
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        Alert.alert(t('error'), t('no_auth_token'), [{ text: t('ok') }]);
        return;
      }

      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API settings response:', data);

      // Validate and set language with fallback
      const languageValue = data.language && languageMap[data.language] 
        ? languageMap[data.language] 
        : 'English';
      setLanguage(languageValue);

      // Validate and set text size with fallback
      const textSizeValue = data.font_size && textSizeMap[data.font_size.toLowerCase()] 
        ? textSizeMap[data.font_size.toLowerCase()] 
        : 'Medium';
      setTextSize(textSizeValue);
      await SecureStore.setItemAsync('text_size', textSizeValue);

      // Validate and set accent with fallback
      const accentValue = data.accent && accentMap[data.accent] 
        ? accentMap[data.accent] 
        : 'indian';
      setAccent(accentValue);
      await SecureStore.setItemAsync('accent', accentValue);

      // Validate and set cultural preference with fallback
      const culturalPreferenceValue = data.cultural_preference && culturalPreferenceMap[data.cultural_preference] 
        ? culturalPreferenceMap[data.cultural_preference] 
        : 'indian';
      setCulturalPreference(culturalPreferenceValue);
      await SecureStore.setItemAsync('cultural_preference', culturalPreferenceValue);

      // Set timezone and country with fallbacks
      const timezoneValue = data.time_zone || 'Asia/Kolkata';
      setTimezone(timezoneValue);
      const countryValue = data.country || 'India';
      setCountry(countryValue);
      await SecureStore.setItemAsync('user_country', countryValue);

      // Store original values for change detection
      const originalValues = {
        language: languageValue,
        textSize: textSizeValue,
        accent: accentValue,
        culturalPreference: culturalPreferenceValue,
        timezone: timezoneValue,
        country: countryValue,
      };
      setOriginalSettings(originalValues);

      // Reset unsaved changes flag
      setHasUnsavedChanges(false);

    } catch (error) {
      console.error('Error fetching settings:', error);
      Alert.alert(t('error'), t('failed_load_settings_server'), [{ text: t('ok') }]);
      
      // Fallback to stored values
      try {
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

        const storedCountry = await SecureStore.getItemAsync('user_country');
        if (storedCountry) {
          setCountry(storedCountry);
        }
      } catch (storageError) {
        console.error('Error reading from secure store:', storageError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced settings saving with better feedback
  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        Alert.alert(t('error'), t('no_auth_token'), [{ text: t('ok') }]);
        return false;
      }

      const payload = {
        language: reverseLanguageMap[language] || 'en',
        font_size: reverseTextSizeMap[textSize] || 'medium',
        accent: reverseAccentMap[accent] || 'indian',
        cultural_preference: reverseCulturalPreferenceMap[culturalPreference] || 'indian',
        time_zone: timezone,
        country,
      };

      console.log('Saving settings payload:', payload);

      const response = await fetch('https://bot.swarnaayu.com/user/settings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Save settings error:', errorData);
        throw new Error(`Failed to save settings: ${response.status}`);
      }

      // Store the updated settings locally with error handling
      try {
        await Promise.all([
          SecureStore.setItemAsync('user_country', country),
          SecureStore.setItemAsync('text_size', textSize),
          SecureStore.setItemAsync('accent', accent),
          SecureStore.setItemAsync('cultural_preference', reverseCulturalPreferenceMap[culturalPreference] || 'indian'),
          SecureStore.setItemAsync('timezone', timezone),
          SecureStore.setItemAsync('settings_just_updated', 'true'),
          SecureStore.setItemAsync('settings_update_timestamp', Date.now().toString()),
        ]);
      } catch (storageError) {
        console.error('Error storing settings locally:', storageError);
        // Don't fail the save operation for local storage errors
      }
      
      // Update original settings to current values after successful save
      setOriginalSettings({
        language,
        textSize,
        accent,
        culturalPreference,
        timezone,
        country,
      });

      // Reset unsaved changes flag
      setHasUnsavedChanges(false);
      
      Alert.alert(t('success'), t('settings_saved_successfully'), [{ text: t('ok') }]);
      return true;

    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert(t('error'), t('failed_save_settings'), [{ text: t('ok') }]);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // useEffect to detect changes whenever settings change
  useEffect(() => {
    checkForChanges();
  }, [language, textSize, accent, culturalPreference, timezone, country]);

  // Enhanced back navigation with unsaved changes warning
  const handleBackNavigation = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        t('unsaved_changes_title'),
        t('unsaved_changes_message'),
        [
          {
            text: t('cancel'),
            style: 'cancel',
          },
          {
            text: t('discard_changes'),
            style: 'destructive',
            onPress: () => {
              // Reset to original values
              setLanguage(originalSettings.language);
              setTextSize(originalSettings.textSize);
              setAccent(originalSettings.accent);
              setCulturalPreference(originalSettings.culturalPreference);
              setTimezone(originalSettings.timezone);
              setCountry(originalSettings.country);
              setHasUnsavedChanges(false);
              
              // Navigate back
              if (router.canGoBack && router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            },
          },
          {
            text: t('save_and_go_back'),
            onPress: async () => {
              try {
                const success = await saveSettings();
                if (success) {
                  if (router.canGoBack && router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace('/');
                  }
                }
              } catch (error) {
                console.error('Failed to save settings:', error);
              }
            },
          },
        ]
      );
    } else {
      // No unsaved changes, navigate normally
      if (router.canGoBack && router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    }
  };

  // Enhanced initialization with better error handling
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        
        // Load stored values as fallback first
        try {
          const [storedTextSize, storedAccent, storedCulturalPreference, storedCountry] = await Promise.all([
            SecureStore.getItemAsync('text_size'),
            SecureStore.getItemAsync('accent'),
            SecureStore.getItemAsync('cultural_preference'),
            SecureStore.getItemAsync('user_country'),
          ]);

          if (storedTextSize && ['Small', 'Medium', 'Large'].includes(storedTextSize)) {
            setTextSize(storedTextSize as TextSizeType);
          }
          if (storedAccent && ['indian', 'US'].includes(storedAccent)) {
            setAccent(storedAccent as Accent);
          }
          if (storedCulturalPreference && ['indian', 'US'].includes(storedCulturalPreference)) {
            setCulturalPreference(storedCulturalPreference as CulturalPreference);
          }
          if (storedCountry) {
            setCountry(storedCountry);
          } else {
            await SecureStore.setItemAsync('user_country', 'India');
          }
        } catch (storageError) {
          console.error('Error loading stored settings:', storageError);
        }

        // Load phone and fetch settings
        await Promise.all([getPhone(), fetchSettings()]);
        
      } catch (error) {
        console.error('Error initializing settings:', error);
        Alert.alert(t('error'), t('failed_initialize_settings'), [{ text: t('ok') }]);
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, []);

  const handleLogout = () => {
    Alert.alert(t('confirm_logout'), t('logout_message'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout'),
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

  // Enhanced SettingRow component
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
    disabled = false,
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
    disabled?: boolean;
  }) => {
    const useRightArrow = [t('edit_profile'), t('my_privacy'), t('about_aayu'), t('help_center')].includes(label);
    
    return (
      <>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={onPress && !disabled ? 0.6 : 1}
          style={[styles.row, disabled && styles.rowDisabled]}
          disabled={disabled}
        >
          <View style={styles.left}>{icon}</View>
          <View style={styles.middle}>
            <ThemedText style={[styles.label, { fontSize: getFontSize() }, disabled && styles.labelDisabled]}>
              {label}
            </ThemedText>
          </View>
          {isToggle ? (
            <Switch value={toggleValue} onValueChange={onToggle} disabled={disabled} />
          ) : (
            <View style={styles.right}>
              {value && (
                <ThemedText style={[styles.value, { fontSize: getFontSize() }, disabled && styles.valueDisabled]}>
                  {value}
                </ThemedText>
              )}
              {hasArrow && (
                <Ionicons
                  name={useRightArrow ? 'chevron-forward' : 'chevron-down'}
                  size={20}
                  color={disabled ? '#ccc' : '#6c63ff'}
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

  // Get current timezone display text
  const getCurrentTimezoneDisplay = () => {
    const timezoneOption = timezoneOptions.find(tz => tz.value === timezone);
    return timezoneOption ? `${t(timezoneOption.tKey)} (${timezoneOption.offset})` : timezone;
  };

  // Get current accent display text
  const getCurrentAccentDisplay = () => {
    return accent === 'indian' ? t('indian_english') : t('american_english');
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

  if (isLoading) {
    return (
     <SafeAreaView style={styles.safeAreaContainer} edges={['top']}>
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#6c63ff" />
          <ThemedText style={styles.loadingText}>{t('loading')}</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top']}>
      <View style={styles.headerContainer}>
        <View style={styles.navbar}>
          {/* Left Item */}
          <TouchableOpacity
            onPress={handleBackNavigation}
            style={styles.navButton}
            accessibilityLabel={t('back_button')}
          >
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          
          {/* Center Item */}
          <ThemedText style={styles.navbarTitle} numberOfLines={1}>{t('settings')}</ThemedText>

          {/* Right Item */}
          <TouchableOpacity
            onPress={saveSettings}
            style={[
              styles.navButton,
              hasUnsavedChanges && styles.saveButtonActive
            ]}
            accessibilityLabel={t('save_settings')}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={hasUnsavedChanges ? '#fff' : '#6c63ff'} />
            ) : (
              <ThemedText style={[
                styles.saveButtonText,
                { fontSize: getFontSize() },
                hasUnsavedChanges && styles.saveButtonTextActive
              ]}>
                {t('save')}
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Enhanced Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLanguageModalVisible(false)} />
        <View style={styles.modalContent}>
          <ThemedText style={[styles.modalTitle, { fontSize: getFontSize() + 2 }]}>
            {t('main_language')}
          </ThemedText>
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
                style={[
                  dynamicStyles.modalOptionText, 
                  language === lang.contextValue && dynamicStyles.modalOptionTextSelected
                ]}
              >
                {lang.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* Enhanced Country Selection Modal */}
      <Modal
        visible={countryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setCountryModalVisible(false)} />
        <View style={styles.modalContent}>
          <ThemedText style={[styles.modalTitle, { fontSize: getFontSize() + 2 }]}>
            {t('country')}
          </ThemedText>
          {countryOptions.map((c) => (
            <TouchableOpacity
              key={c.value}
              style={[styles.modalOption, country === c.value && styles.modalOptionSelected]}
              onPress={() => {
                setCountry(c.value as 'India' | 'US');
                setCountryModalVisible(false);
                // Auto-update timezone based on country
                const newTimezone = c.value === 'India' ? 'Asia/Kolkata' : 'America/New_York';
                setTimezone(newTimezone);
              }}
            >
              <ThemedText
                style={[
                  dynamicStyles.modalOptionText, 
                  country === c.value && dynamicStyles.modalOptionTextSelected
                ]}
              >
                {c.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* Enhanced Timezone Selection Modal */}
      <Modal
        visible={timezoneModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTimezoneModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setTimezoneModalVisible(false)} />
        <View style={styles.modalContent}>
          <ThemedText style={[styles.modalTitle, { fontSize: getFontSize() + 2 }]}>
            {t('timezone')}
          </ThemedText>
          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            {timezoneOptions.map((tz) => (
              <TouchableOpacity
                key={tz.value}
                style={[styles.modalOption, timezone === tz.value && styles.modalOptionSelected]}
                onPress={() => {
                  setTimezone(tz.value);
                  setTimezoneModalVisible(false);
                }}
              >
                <View style={styles.timezoneOptionContent}>
                  <ThemedText
                    style={[
                      dynamicStyles.modalOptionText, 
                      timezone === tz.value && dynamicStyles.modalOptionTextSelected
                    ]}
                  >
                    {t(tz.tKey)}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.timezoneOffset,
                      { fontSize: getFontSize() - 2 },
                      timezone === tz.value && { color: '#6c63ff' }
                    ]}
                  >
                    {tz.offset}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Enhanced Accent Selection Modal */}
      <Modal
        visible={accentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAccentModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setAccentModalVisible(false)} />
        <View style={styles.modalContent}>
          <ThemedText style={[styles.modalTitle, { fontSize: getFontSize() + 2 }]}>
            {t('accent')}
          </ThemedText>
          <ThemedText style={[styles.modalSubtitle, { fontSize: getFontSize() - 1 }]}>
            {t('accent_selection_subtitle')}
          </ThemedText>
          {accentOptionsEnhanced.map((acc) => (
            <TouchableOpacity
              key={acc.value}
              style={[styles.modalOption, accent === acc.value && styles.modalOptionSelected]}
              onPress={() => {
                setAccent(acc.value);
                setAccentModalVisible(false);
              }}
            >
              <View style={styles.accentOptionContent}>
                <ThemedText
                  style={[
                    dynamicStyles.modalOptionText, 
                    accent === acc.value && dynamicStyles.modalOptionTextSelected
                  ]}
                >
                  {acc.value === 'indian' ? t('indian_english') : t('american_english')}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.accentDescription,
                    { fontSize: getFontSize() - 2 },
                    accent === acc.value && { color: '#6c63ff' }
                  ]}
                >
                  {acc.value === 'indian' ? t('indian_accent_description') : t('american_accent_description')}
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* Enhanced Cultural Preference Modal */}
      <Modal
        visible={culturalPreferenceModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCulturalPreferenceModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setCulturalPreferenceModalVisible(false)} />
        <View style={styles.modalContent}>
          <ThemedText style={[styles.modalTitle, { fontSize: getFontSize() + 2 }]}>
            {t('cultural_preference')}
          </ThemedText>
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
                style={[
                  dynamicStyles.modalOptionText, 
                  culturalPreference === cp.value && dynamicStyles.modalOptionTextSelected
                ]}
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
        <SettingRow 
          label={t('whatsapp_number')} 
          value={phoneNumber || t('loading')} 
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

        <ThemedText type="title" style={[styles.sectionTitleMain, { fontSize: getFontSize() + 4 }]}>
          {t('voice_audio')}
        </ThemedText>
        <SettingRow 
          label={t('microphone_access')} 
          value={t('allowed')} 
          hasArrow={false} 
        />
        <SettingRow
          label={t('accent')}
          value={getCurrentAccentDisplay()}
          onPress={() => setAccentModalVisible(true)}
          hasArrow
        />

        <ThemedText type="title" style={[styles.sectionTitleMain, { fontSize: getFontSize() + 4 }]}>
          {t('language')}
        </ThemedText>
        <SettingRow
          label={t('main_language')}
          value={t(language.toLowerCase())}
          onPress={() => setLanguageModalVisible(true)}
          hasArrow
        />

        <ThemedText type="title" style={[styles.sectionTitleMain, { fontSize: getFontSize() + 4 }]}>
          {t('country')}
        </ThemedText>
        <SettingRow
          label={t('country')}
          value={t(country.toLowerCase())}
          onPress={() => setCountryModalVisible(true)}
          hasArrow
        />

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
                console.log(`Text size set to: ${size}`);
              }}
            >
              <ThemedText 
                style={[
                  styles.textSizeButtonText,
                  textSize === size && styles.textSizeButtonTextActive,
                  { fontSize: BUTTON_LABEL_FONT_SIZES[size] },
                ]}
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
          value={getCurrentTimezoneDisplay()}
          onPress={() => setTimezoneModalVisible(true)}
          hasArrow
        />

        <ThemedText type="title" style={[styles.sectionTitleMain, { fontSize: getFontSize() + 4 }]}>
          {t('support')}
        </ThemedText>
        <SettingRow 
          label={t('help_center')} 
          onPress={() => router.push('/help-center')} 
          hasArrow 
        />
        <SettingRow 
          label={t('about_aayu')} 
          onPress={() => router.push('/about-aayu')} 
          hasArrow 
        />

        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#e53935" />
          <ThemedText style={styles.logoutText}>{t('logout')}</ThemedText>
        </TouchableOpacity>

        {/* Unsaved changes indicator */}
        {hasUnsavedChanges && (
          <View style={styles.unsavedChangesIndicator}>
            <Ionicons name="warning-outline" size={16} color="#ff9800" />
            <ThemedText style={styles.unsavedChangesText}>
              {t('unsaved_changes_warning')}
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
  backgroundColor: '#fff',
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
  marginTop: -40, // Add this line
},
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50, // CHANGE: Reduced height for a more compact header
    paddingHorizontal: 10,
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navbarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '700',
    color: '#111',
    // CHANGE: Adjusted padding and line height for the new navbar height
    paddingTop: 4, 
    lineHeight: 30, 
  },
  saveButtonActive: {
    //add our style removing due to size issue of large text
  },
  saveButtonText: {
    color: '#6c63ff',
    fontWeight: '600',
  },
  saveButtonTextActive: {
    //add our style removing due to size issue of large text
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
  rowDisabled: {
    opacity: 0.5,
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
  labelDisabled: {
    color: '#999',
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
  valueDisabled: {
    color: '#ccc',
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
    maxHeight: '70%',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#222',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
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
  timezoneOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timezoneOffset: {
    color: '#666',
    fontSize: 14,
  },
  accentOptionContent: {
    alignItems: 'center',
  },
  accentDescription: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  unsavedChangesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    marginVertical: 16,
    gap: 8,
  },
  unsavedChangesText: {
    color: '#ff9800',
    fontSize: 14,
    fontWeight: '600',
  },
});