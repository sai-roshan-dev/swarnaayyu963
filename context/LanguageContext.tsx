import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

type Language = 'English' | 'Hindi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation data
const translations: Record<Language, Record<string, string>> = {
  English: {
    // Settings
    'settings': 'Settings',
    'account': 'Account',
    'whatsapp_number': 'WhatsApp Number',
    'edit_profile': 'Edit Profile',
    'my_privacy': 'My Privacy',
    'voice_audio': 'Voice & Audio',
    'microphone_access': 'Microphone Access',
    'allowed': 'Allowed',
    'language': 'Language',
    'main_language': 'Main Language',
    'text_size': 'Text Size',
    'small': 'Small',
    'medium': 'Medium',
    'large': 'Large',
    'timezone': 'Timezone',
    'current_timezone': 'Current Timezone',
    'support': 'Support',
    'help_center': 'Help Center',
    'about_aayu': 'About Aayu',
    'logout': 'Logout',
    'confirm_logout': 'Confirm Logout',
    'logout_message': 'Are you sure you want to log out?',
    'cancel': 'Cancel',
    // History
    'history': 'History',
    'type_message': 'Type a message...',
    'play_audio': 'Play Audio',
    'pause': 'Pause',
    'typing': 'Typing...',
    // Common
    'back': 'Back',
    'save': 'Save',
    'edit': 'Edit',
    'delete': 'Delete',
    'close': 'Close',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'retry': 'Retry',
    'name': 'Name',
    'age': 'Age',
    'gender': 'Gender',
    'country': 'Country',
    'select_country': 'Select your country',
    'account_exists': 'Account don"t Already Exists',
    'registering': 'Registering...',
    'otp_resent': 'A new OTP has been sent to your phone.',
    'otp_resend_failed': 'Failed to resend OTP. Please try again.',
    'didnt_receive_code': "Didn't receive the code?",
    'resending': 'Resending...',
    'login_success': "You're successfully logged in",
    'delete_account': 'Delete Account',
    'delete_account_message': 'Are you sure you want to delete your account? This action cannot be undone.',
    'profile_updated': 'Profile Updated',
    'profile_updated_message': 'Your profile has been updated successfully.',
    'saving': 'Saving...',
    // Navigation
    'home': 'Home',
    'explore': 'Explore',
    'profile': 'Profile',
    // Auth
    'login': 'Login',
    'register': 'Register',
    'welcome': 'Welcome',
    'login_subtitle': 'Login to continue your journey with Aayu.',
    'is_required': 'is required',
    'must_be_digits': 'must be at least 10 digits',
    'continue_to': 'Continue to',
    'enter_phone': 'Enter your phone number',
    'phone_required': 'Phone number is required',
    'phone_digits': 'Phone number must be at least 10 digits',
    'phone_number': 'Phone Number',
    'password': 'Password',
    'confirm_password': 'Confirm Password',
    'forgot_password': 'Forgot Password?',
    'dont_have_account': "Don't have an account?",
    'already_have_account': 'Already have an account?',
    'sign_up': 'Sign Up',
    'sign_in': 'Sign In',
    'otp_verification': 'OTP Verification',
    'enter_otp': 'Enter OTP sent to your phone',
    'resend_otp': 'Resend OTP',
    'verify': 'Verify',
    'account_created': 'Account Created',
    'account_created_message': 'Your account has been successfully created!',
    // AI Voice
    'ai_voice': 'AI Voice',
    'speaking': 'Speaking',
    'listening': 'Listening',
    'connecting': 'Connecting',
    'idle': 'Idle',
    'mic_off': 'Mic Off',
    // Onboarding
    'onboarding_title_1': 'Welcome to Aayu',
    'onboarding_title_2': 'AI Voice Assistant',
    'onboarding_title_3': 'Get Started',
    'onboarding_desc_1': 'Your personal AI voice assistant for everyday tasks',
    'onboarding_desc_2': 'Natural conversations with advanced AI technology',
    'onboarding_desc_3': 'Start your journey with Aayu today',
    'skip': 'Skip',
    'next': 'Next',
    'get_started': 'Get Started',
    // About
    'about': 'About',
    'version': 'Version',
    'privacy_policy': 'Privacy Policy',
    'terms_of_service': 'Terms of Service',
    'contact_us': 'Contact Us',
    // Errors
    'network_error': 'Network Error',
    'try_again': 'Please try again',
    'permission_denied': 'Permission Denied',
    'microphone_permission': 'Microphone permission is required',
    'invalid_phone': 'Invalid phone number',
    'invalid_otp': 'Invalid OTP',
    'something_went_wrong': 'Something went wrong',
    'data_sharing_protection': 'Data Sharing & Protection',
    'no_sell_data': 'We do not sell your personal data.',
    'share_with_trusted': 'We may share data with trusted third party providers for essential services (e.g cloud storage).',
    'encryption_security': 'We implement encryption and security measures to protect your information.',
    'rights_choices': 'Your Rights & Choices',
    'access_update_delete': 'You can access, update, or delete your data at any time.',
    'opt_out_data': 'You can opt out of certain data collection by adjusting your settings.',
    'changes_policy': 'Changes to This Policy',
    'policy_update_note': 'We may update this Privacy Policy as needed. Any changes will be posted here with an update date.',
    'policy_questions': 'For questions about this policy, contact us at',
  },
  Hindi: {
    // Settings
    'settings': 'सेटिंग्स',
    'account': 'खाता',
    'whatsapp_number': 'व्हाट्सऐप नंबर',
    'edit_profile': 'प्रोफाइल संपादित करें',
    'my_privacy': 'मेरी गोपनीयता',
    'voice_audio': 'आवाज और ऑडियो',
    'microphone_access': 'माइक्रोफोन एक्सेस',
    'allowed': 'अनुमति दी गई',
    'language': 'भाषा',
    'main_language': 'मुख्य भाषा',
    'text_size': 'टेक्स्ट आकार',
    'small': 'छोटा',
    'medium': 'मध्यम',
    'large': 'बड़ा',
    'timezone': 'समय क्षेत्र',
    'current_timezone': 'वर्तमान समय क्षेत्र',
    'support': 'सहायता',
    'help_center': 'सहायता केंद्र',
    'about_aayu': 'आयु के बारे में',
    'logout': 'लॉगआउट',
    'confirm_logout': 'लॉगआउट की पुष्टि करें',
    'logout_message': 'क्या आप वाकई लॉगआउट करना चाहते हैं?',
    'cancel': 'रद्द करें',
    // History
    'history': 'इतिहास',
    'type_message': 'संदेश लिखें...',
    'play_audio': 'ऑडियो चलाएं',
    'pause': 'रोकें',
    'typing': 'टाइप कर रहे हैं...',
    // Common
    'back': 'वापस',
    'save': 'सहेजें',
    'edit': 'संपादित करें',
    'delete': 'हटाएं',
    'close': 'बंद करें',
    'loading': 'लोड हो रहा है...',
    'error': 'त्रुटि',
    'success': 'सफलता',
    'retry': 'पुनः प्रयास करें',
    'name': 'नाम',
    'age': 'उम्र',
    'gender': 'लिंग',
    'country': 'देश',
    'select_country': 'अपना देश चुनें',
    'account_exists': 'खाता पहले से nahi मौजूद है',
    'registering': 'पंजीकरण हो रहा है...',
    'otp_resent': 'आपके फोन पर एक नया OTP भेजा गया है।',
    'otp_resend_failed': 'OTP पुनः भेजने में विफल। कृपया पुनः प्रयास करें।',
    'didnt_receive_code': 'कोड नहीं मिला?',
    'resending': 'पुनः भेज रहे हैं...',
    'login_success': 'आप सफलतापूर्वक लॉग इन हो गए हैं',
    'delete_account': 'खाता हटाएं',
    'delete_account_message': 'क्या आप वाकई अपना खाता हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।',
    'profile_updated': 'प्रोफाइल अपडेट किया गया',
    'profile_updated_message': 'आपका प्रोफाइल सफलतापूर्वक अपडेट किया गया है।',
    'saving': 'सहेज रहे हैं...',
    // Navigation
    'home': 'होम',
    'explore': 'खोजें',
    'profile': 'प्रोफाइल',
    // Auth
    'login': 'लॉगिन',
    'register': 'पंजीकरण',
    'welcome': 'स्वागत है',
    'login_subtitle': 'Aayu के साथ अपनी यात्रा जारी रखने के लिए लॉगिन करें।',
    'is_required': 'आवश्यक है',
    'must_be_digits': 'कम से कम 10 अंक होने चाहिए',
    'continue_to': 'जारी रखें',
    'enter_phone': 'अपना फोन नंबर दर्ज करें',
    'phone_required': 'फोन नंबर आवश्यक है',
    'phone_digits': 'फोन नंबर कम से कम 10 अंक का होना चाहिए',
    'phone_number': 'फोन नंबर',
    'password': 'पासवर्ड',
    'confirm_password': 'पासवर्ड की पुष्टि करें',
    'forgot_password': 'पासवर्ड भूल गए?',
    'dont_have_account': 'खाता नहीं है?',
    'already_have_account': 'पहले से खाता है?',
    'sign_up': 'साइन अप',
    'sign_in': 'साइन इन',
    'otp_verification': 'OTP सत्यापन',
    'enter_otp': 'आपके फोन पर भेजे गए OTP को दर्ज करें',
    'resend_otp': 'OTP पुनः भेजें',
    'verify': 'सत्यापित करें',
    'account_created': 'खाता बनाया गया',
    'account_created_message': 'आपका खाता सफलतापूर्वक बनाया गया है!',
    // AI Voice
    'ai_voice': 'AI आवाज',
    'speaking': 'बोल रहे हैं',
    'listening': 'सुन रहे हैं',
    'connecting': 'कनेक्ट हो रहे हैं',
    'idle': 'निष्क्रिय',
    'mic_off': 'माइक बंद',
    // Onboarding
    'onboarding_title_1': 'आयु में आपका स्वागत है',
    'onboarding_title_2': 'AI वॉइस असिस्टेंट',
    'onboarding_title_3': 'शुरू करें',
    'onboarding_desc_1': 'रोजमर्रा के कार्यों के लिए आपका व्यक्तिगत AI वॉइस असिस्टेंट',
    'onboarding_desc_2': 'उन्नत AI तकनीक के साथ प्राकृतिक बातचीत',
    'onboarding_desc_3': 'आज ही आयु के साथ अपनी यात्रा शुरू करें',
    'skip': 'छोड़ें',
    'next': 'अगला',
    'get_started': 'शुरू करें',
    // About
    'about': 'के बारे में',
    'version': 'संस्करण',
    'privacy_policy': 'गोपनीयता नीति',
    'terms_of_service': 'सेवा की शर्तें',
    'contact_us': 'हमसे संपर्क करें',
    // Errors
    'network_error': 'नेटवर्क त्रुटि',
    'try_again': 'कृपया पुनः प्रयास करें',
    'permission_denied': 'अनुमति अस्वीकृत',
    'microphone_permission': 'माइक्रोफोन की अनुमति आवश्यक है',
    'invalid_phone': 'अमान्य फोन नंबर',
    'invalid_otp': 'अमान्य OTP',
    'something_went_wrong': 'कुछ गलत हो गया',
    'data_sharing_protection': 'डेटा साझाकरण और सुरक्षा',
    'no_sell_data': 'हम आपके व्यक्तिगत डेटा को नहीं बेचते हैं।',
    'share_with_trusted': 'हम आवश्यक सेवाओं के लिए विश्वसनीय तृतीय पक्ष प्रदाताओं के साथ डेटा साझा कर सकते हैं (जैसे क्लाउड स्टोरेज)।',
    'encryption_security': 'हम आपकी जानकारी की सुरक्षा के लिए एन्क्रिप्शन और सुरक्षा उपाय लागू करते हैं।',
    'rights_choices': 'आपके अधिकार और विकल्प',
    'access_update_delete': 'आप कभी भी अपने डेटा को एक्सेस, अपडेट या डिलीट कर सकते हैं।',
    'opt_out_data': 'आप अपनी सेटिंग्स समायोजित करके कुछ डेटा संग्रह से बाहर निकल सकते हैं।',
    'changes_policy': 'इस नीति में परिवर्तन',
    'policy_update_note': 'हम आवश्यकतानुसार इस गोपनीयता नीति को अपडेट कर सकते हैं। कोई भी परिवर्तन यहां अपडेट तिथि के साथ पोस्ट किया जाएगा।',
    'policy_questions': 'इस नीति के बारे में प्रश्नों के लिए, हमसे संपर्क करें',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('English');

  useEffect(() => {
    // Load saved language preference
    const loadLanguage = async () => {
      try {
        const savedLanguage = await SecureStore.getItemAsync('language');
        if (savedLanguage && (savedLanguage === 'English' || savedLanguage === 'Hindi')) {
          setLanguageState(savedLanguage as Language);
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    try {
      await SecureStore.setItemAsync('language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 