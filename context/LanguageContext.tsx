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
type TranslationValue = string | { [key: string]: TranslationValue };
type Translations = Record<Language, { [key: string]: TranslationValue }>;

const translations: Translations = {
  English: {
    voice: {
      connecting: 'Connecting...',
      listening: 'Listening...',
      speaking: 'Speaking...',
      tap_to_speak: 'Tap to speak',
      microphone_off: 'Microphone Off',
    },
    // Settings
    'settings': 'Settings',
    'account': 'Account',
    'whatsapp_number': 'WhatsApp Number',
    'edit_profile': 'Edit Profile',
    'my_privacy': 'Privacy Policy',
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
    'accent': 'Accent',
    'culture': 'Culture',
    'cultural_preference': 'Cultural Preferences',
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
    'account_exists': 'Account doesn`t Exists',
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
    'Register': 'Register',
    'welcome': 'Welcome',
    'login_subtitle': 'Login to continue your journey with Aayu.',
    'is_required': 'is required',
    'must_be_digits': 'must be at least 10 digits',
    'continue_to': 'Continue to',
    'enter_phone': 'Enter your WhatsApp Number',
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
    'enter_otp': 'Enter OTP',
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
    // Onboarding (nested)
    onboarding: {
      title_1: 'Welcome to Aayu',
      desc_1: 'Your personal AI voice assistant for everyday tasks',
      title_2: 'AI Voice Assistant',
      desc_2: 'Natural conversations with advanced AI technology',
      title_3: 'Get Started',
      desc_3: 'Start your journey with Aayu today',
      skip: 'Skip',
      next: 'Next',
      get_started: 'Get Started',
    },
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
    "welcome_intro": "Welcome to Aayu! Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal data when you use our services.",
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
    "info_we_collect": "Information We Collect",
  "personal_info": "Personal Information",
  "personal_info_desc": "Name, email, and other details you provide when signing up.",
  "usage_data": "Usage Data",
  "usage_data_desc": "Interactions with Aayu, including voice inputs, messages, preferences, and device information.",
  "third_party_data": "Third-Party Data",
  "third_party_data_desc": "If you connect external services, we may access relevant data as permitted.",
  "how_we_use_info": "How We Use Your Information",
  "provide_personalize_app": "Provide, personalize, and improve the app experience.",
  "help_reminders_conversations": "Help you with reminders, conversations, and useful daily interactions.",
  "support_secure_experience": "Support your requests and keep your experience secure.",
  "analyze_usage_patterns": "Analyze usage patterns to improve app performance and reliability.",
  "last_updated": "Last Updated: August 09, 2025",
  "cannot_open_email": "Unable to open email client.",

  //About-tab
    //"about_aayu": "About Aayu",
    "main_description": "Meet Aayu, your friendly AI companion crafted for seniors. Aayu chats with you, shares daily news, and offers gentle reminders to keep you on track—all at your pace, with warmth and care.",
    "aayu_highlight": "Aayu",
    "features_title": "What Aayu Offers",
    "feature_1": "Friendly chats anytime",
    "feature_2": "Gentle daily reminders",
    "feature_3": "Latest news updates",
    "feature_4": "Support at your pace",
    "get_in_touch": "Get in Touch",
    "signature": "With warmth and care,\\nThe Aayu Team",
    "aayu_team_alert_title": "Aayu Team",
    "aayu_team_alert_message": "We're a dedicated team passionate about making technology accessible and helpful for everyone.",
    //help-center key values
'help_center_title': 'Help Center',
'help_center_welcome': 'Welcome to the Aayu Help Center! Find answers to common questions and learn how to make the most of your AI companion.',
'getting_started_title': 'Getting Started',
'getting_started_desc': 'Learn the basics of using Aayu',
'voice_commands_title': 'Voice Commands',
'voice_commands_desc': 'How to interact with Aayu using voice',
'settings_preferences_title': 'Settings & Preferences',
'settings_preferences_desc': 'Customize your Aayu experience',
'troubleshooting_title': 'Troubleshooting',
'troubleshooting_desc': 'Common issues and solutions',
'need_more_help': 'Need More Help?',
'contact_section_text': 'If you can\'t find what you\'re looking for, our support team is here to help you.',
'contact_button': 'Contact Support',
//time-zone english key values
 'india': 'India',
    'us_country': 'US',
    'indian': 'Indian',
    'us_accent': 'US',
    'india_asia_kolkata': 'India (Asia/Kolkata)',
    'america_new_york': 'USA (America/New_York)',
    'europe_london': 'UK (Europe/London)',
    'australia_sydney': 'Australia (Australia/Sydney)',
    'asia_tokyo': 'Japan (Asia/Tokyo)',
    'europe_berlin': 'Germany (Europe/Berlin)',
    'america_sao_paulo': 'Brazil (America/Sao_Paulo)',
// index file values
    'welcome_to_aayu': 'Welcome to Aayu',
    'ai_powered_health_companion': 'Your AI-powered health companion',
    'voice_chat': 'Voice Chat',
    'ai_assistant': 'AI Assistant',
    'health_insights': 'Health Insights',

    // not found values
    'oops': 'Oops!',
    'screen_not_exist': "This screen doesn't exist.",
    'go_to_home': 'Go to home screen!',

    //font size onboading values
    'font_size_question': 'What font size feels\nbest for you?',
    //'small': 'Small',
    //'medium': 'Medium',
    //'large': 'Large',
    'next': 'Next',
// language boading values
'language_preference_question': 'Which Language do\nyou prefer?',
'english': 'English',
'hindi': 'Hindi',
'proceed': 'Proceed',
// login tab values
    //'welcome': 'Welcome!',
    //'login_subtitle': 'Please log in to continue with Aayu',
    //'whatsapp_number': 'WhatsApp Number',
    //'enter_phone': 'Enter your phone number',
    //'phone_required': 'Phone number is required.',
    //'phone_digits': 'Phone number must be at least 8 digits.',
    //'login': 'Login',
    //'register': 'Register',
    //'dont_have_account': "Don't have an account?",
    'account_not_found': 'Account not found. Please',
    'login_alert': 'Login Alert',
    //'something_went_wrong': 'Something went wrong!',
    'ok': 'OK',
//voice -action values
    //'history': 'History',
    'toggle_mic': 'Toggle Microphone',
    //'settings': 'Settings',
// new added setting features key values
 'accent_selection_subtitle': 'Choose your preferred voice accent',
  'unsaved_changes_warning': 'You have unsaved changes',
  'indian_english': 'Indian English',
  'american_english': 'American English',
  'indian_accent_description': 'Clear Indian accent for natural conversation',
  'american_accent_description': 'Standard American pronunciation',
  //new added setting alert values
  
  "failed_load_phone": 'Failed to load phone number.',
  "no_auth_token": "No authentication token found.",
  "failed_load_settings_server": "Failed to load settings from the server.",
  "settings_saved_successfully": "Settings saved successfully.",
  "failed_save_settings": "Failed to save settings.",
  "unsaved_changes_title": "Unsaved Changes",
  "unsaved_changes_message": "You have unsaved changes. What would you like to do?",
  "discard_changes": "Discard Changes",
  "save_and_go_back": "Save & Go Back",
  "failed_initialize_settings": "Failed to initialize settings.",
  "save_settings": "Save Settings",
  "back_button": "Back",
"today": "Today",
"yesterday": "Yesterday",
"at": "at",
"invalid_date": "Invalid date",
"monthNames": {
    "0": "Jan",
    "1": "Feb",
    "2": "Mar",
    "3": "Apr",
    "4": "May",
    "5": "Jun",
    "6": "Jul",
    "7": "Aug",
    "8": "Sep",
    "9": "Oct",
    "10": "Nov",
    "11": "Dec"
},

    // Register
    register: {
      prompt_fullname: "Great to see you!\nWhat’s your name?",
      placeholder_fullname: "Type your name...",
      prompt_age: "Awesome!\nWhat’s your age?",
      placeholder_age: "Type your age...",
      prompt_gender: "What’s your gender?",
      prompt_phone: "Almost Done!\nWhat’s your WhatsApp number?",
      placeholder_phone: "Enter WhatsApp Number"
    },
    male: "Male",
    female: "Female",
    prefer_not_to_say: "Prefer not to say",
  },
  Hindi: {
    voice: {
      connecting: 'कनेक्ट हो रहा है...',
      listening: 'सुन रहा है...',
      speaking: 'बोल रहा है...',
      tap_to_speak: 'बोलने के लिए टैप करें',
      microphone_off: 'माइक्रोफोन बंद है',
    },
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
    'accent': 'लहजा',
    'culture': 'संस्कृति',
    'cultural_preference': 'सांस्कृतिक प्राथमिकताएँ',
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
    //'register': 'पंजीकरण',
   'register': 'रजिस्टर करें',
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
    // Onboarding (nested)
    onboarding: {
      title_1: 'आयु में आपका स्वागत है',
      desc_1: 'रोजमर्रा के कार्यों के लिए आपका व्यक्तिगत AI वॉइस असिस्टेंट',
      title_2: 'AI वॉइस असिस्टेंट',
      desc_2: 'उन्नत AI तकनीक के साथ प्राकृतिक बातचीत',
      title_3: 'शुरू करें',
      desc_3: 'आज ही आयु के साथ अपनी यात्रा शुरू करें',
      "skip": "छोड़ें",
      "next": "अगला",
      "get_started": "शुरू करें"
    },
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
  
    // About tab hindi
//"about_aayu": "आयु के बारे में",
"main_description": "पेश है आयु, आपका मित्रवत एआई साथी जो वरिष्ठों के लिए तैयार किया गया है। आयु आपसे बात करता है, रोज़ाना खबरें साझा करता है, और आपको सही रास्ते पर रखने के लिए हल्के अनुस्मारक देता है—यह सब आपकी गति से, गर्मजोशी और देखभाल के साथ।",
"aayu_highlight": "आयु",
"features_title": "आयु क्या प्रदान करता है",
"feature_1": "कभी भी दोस्ताना चैट",
"feature_2": "रोजाना हल्के अनुस्मारक",
"feature_3": "नवीनतम समाचार अपडेट",
"feature_4": "अपनी गति से समर्थन",
"get_in_touch": "संपर्क करें",
"signature": "गर्मजोशी और देखभाल के साथ,\\nआयु टीम",
"aayu_team_alert_title": "आयु टीम",
"aayu_team_alert_message": "हम एक समर्पित टीम हैं जो प्रौद्योगिकी को सभी के लिए सुलभ और सहायक बनाने के लिए उत्सुक हैं।",
// Hindi help center values
'help_center_title': 'सहायता केंद्र',
'help_center_welcome': 'आयु सहायता केंद्र में आपका स्वागत है! सामान्य प्रश्नों के उत्तर ढूंढें और जानें कि अपने एआई साथी का अधिकतम लाभ कैसे उठाएं।',
'getting_started_title': 'शुरू करना',
'getting_started_desc': 'आयु का उपयोग करने की मूल बातें जानें',
'voice_commands_title': 'आवाज आदेश',
'voice_commands_desc': 'आवाज का उपयोग करके आयु के साथ कैसे बातचीत करें',
'settings_preferences_title': 'सेटिंग्स और प्राथमिकताएँ',
'settings_preferences_desc': 'अपने आयु अनुभव को अनुकूलित करें',
'troubleshooting_title': 'समस्या निवारण',
'troubleshooting_desc': 'सामान्य मुद्दे और समाधान',
'need_more_help': 'अधिक सहायता की आवश्यकता है?',
'contact_section_text': 'यदि आप जो खोज रहे हैं वह नहीं मिल रहा है, तो हमारी सहायता टीम आपकी मदद करने के लिए यहाँ है।',
'contact_button': 'सहायता से संपर्क करें',
//timeZone Options
    'india': 'भारत',
    'us_country': 'अमेरिका',
    'indian': 'भारतीय',
    'us_accent': 'अमेरिकी',
    'india_asia_kolkata': 'भारत (एशिया/कोलकाता)',
    'america_new_york': 'यूएसए (अमेरिका/न्यू यॉर्क)',
    'europe_london': 'यूके (यूरोप/लंदन)',
    'australia_sydney': 'ऑस्ट्रेलिया (ऑस्ट्रेलिया/सिडनी)',
    'asia_tokyo': 'जापान (एशिया/टोक्यो)',
    'europe_berlin': 'जर्मनी (यूरोप/बर्लिन)',
    'america_sao_paulo': 'ब्राजील (अमेरिका/साओ पाउलो)',
//index key value 
    'welcome_to_aayu': 'आयु में आपका स्वागत है',
    'ai_powered_health_companion': 'आपका AI-संचालित स्वास्थ्य साथी',
    'voice_chat': 'वॉइस चैट',
    'ai_assistant': 'AI सहायक',
    'health_insights': 'स्वास्थ्य संबंधी जानकारी',
//not found hindi values
    'oops': 'ओह!',
    'screen_not_exist': 'यह स्क्रीन मौजूद नहीं है।',
    'go_to_home': 'होम स्क्रीन पर जाएं!',
//font size onboading values
   'font_size_question': 'आपके लिए कौन सा फ़ॉन्ट आकार\nसबसे अच्छा लगता है?',
   // 'small': 'छोटा',
    //'medium': 'मध्यम',
    //'large': 'बड़ा',
    'next': 'अगला',
 // language boading hindi values
   'language_preference_question': 'आप कौन सी भाषा\nपसंद करते हैं?',
   'english': 'अंग्रेज़ी',
   'hindi': 'हिंदी',
   'proceed': 'आगे बढ़ें',
   // login tab hindi values
   //'welcome': 'आपका स्वागत है!',
    //'login_subtitle': 'आयु के साथ जारी रखने के लिए कृपया लॉग इन करें',
    //'whatsapp_number': 'व्हाट्सएप नंबर',
    //'enter_phone': 'अपना फ़ोन नंबर दर्ज करें',
    //'phone_required': 'फ़ोन नंबर आवश्यक है।',
    //'phone_digits': 'फ़ोन नंबर कम से कम 8 अंकों का होना चाहिए।',
    //'login': 'लॉग इन करें',
    "register_button": "रजिस्टर करें",
    //'register': 'रजिस्टर करें',
    //'dont_have_account': 'क्या आपका खाता नहीं है?',
    'account_not_found': 'खाता नहीं मिला। कृपया',
    'login_alert': 'लॉगिन चेतावनी',
    //'something_went_wrong': 'कुछ गलत हो गया!',
    'ok': 'ठीक है',
    // voice values key values
     //'history': 'इतिहास',
    'toggle_mic': 'माइक्रोफ़ोन टॉगल करें',
    //'settings': 'सेटिंग्स',
// new added setting features hindi key values
'accent_selection_subtitle': 'अपना पसंदीदा आवाज़ का लहजा चुनें',
  'unsaved_changes_warning': 'आपके पास असहेजे गए परिवर्तन हैं',
  'indian_english': 'भारतीय अंग्रेजी',
  'american_english': 'अमेरिकी अंग्रेजी',
  'indian_accent_description': 'प्राकृतिक बातचीत के लिए स्पष्ट भारतीय लहजा',
  'american_accent_description': 'मानक अमेरिकी उच्चारण',
  // new added key values
  "failed_load_phone": "फ़ोन नंबर लोड करने में विफल।",
  "no_auth_token": "कोई प्रमाणीकरण टोकन नहीं मिला।",
  "failed_load_settings_server": "सर्वर से सेटिंग्स लोड करने में विफल।",
  "settings_saved_successfully": "सेटिंग्स सफलतापूर्वक सहेजी गईं।",
  "failed_save_settings": "सेटिंग्स सहेजने में विफल।",
  "unsaved_changes_title": "अपरिवर्तित परिवर्तन",
  "unsaved_changes_message": "आपके पास असहेजे गए परिवर्तन हैं। आप क्या करना चाहेंगे?",
  "discard_changes": "परिवर्तनों को त्यागें",
  "save_and_go_back": "सहेजें और वापस जाएं",
  "failed_initialize_settings": "सेटिंग्स प्रारंभ करने में विफल।",
  "save_settings": "सेटिंग्स सहेजें",
  "back_button": "वापस",
  //chatscreen messages
  "today": "आज",
"yesterday": "कल",
"at": "को",
"invalid_date": "अमान्य दिनांक",
"monthNames": {
    "0": "जनवरी",
    "1": "फ़रवरी",
    "2": "मार्च",
    "3": "अप्रैल",
    "4": "मई",
    "5": "जून",
    "6": "जुलाई",
    "7": "अगस्त",
    "8": "सितंबर",
    "9": "अक्टूबर",
    "10": "नवंबर",
    "11": "दिसंबर"
},
// extra key values
"secure_store_error": "सुरक्षित स्टोर तक नहीं पहुंच सका।",
  "confirm_delete_title": "हटाने की पुष्टि करें",
  "confirm_delete_message": "क्या आप वाकई अपना खाता हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।",
  "account_deleted_success": "आपका खाता सफलतापूर्वक हटा दिया गया है।",
  "delete_account_failed": "खाता हटाने में विफल। कृपया बाद में पुन: प्रयास करें।",
  "contact_email": "ईमेल के माध्यम से हमसे संपर्क करें",
  //"delete": "हटाएं",
  // my privacy key values
  "info_we_collect": "हम जो जानकारी एकत्र करते हैं",
  "personal_info": "व्यक्तिगत जानकारी",
  "personal_info_desc": "साइन अप करते समय आपके द्वारा प्रदान किया गया नाम, ईमेल और अन्य विवरण।",
  "usage_data": "उपयोग डेटा",
  "usage_data_desc": "आयु के साथ आपकी बातचीत, जिसमें वॉयस इनपुट, संदेश, प्राथमिकताएं और डिवाइस की जानकारी शामिल है।",
  "third_party_data": "तृतीय-पक्ष डेटा",
  "third_party_data_desc": "यदि आप बाहरी सेवाओं को जोड़ते हैं, तो हम अनुमति के अनुसार प्रासंगिक डेटा तक पहुंच सकते हैं।",
  "how_we_use_info": "हम आपकी जानकारी का उपयोग कैसे करते हैं",
  "provide_personalize_app": "ऐप अनुभव को प्रदान करना, वैयक्तिकृत करना और सुधारना।",
  "help_reminders_conversations": "अनुस्मारक, बातचीत और उपयोगी दैनिक बातचीत में आपकी सहायता करना।",
  "support_secure_experience": "आपके अनुरोधों का समर्थन करना और आपके अनुभव को सुरक्षित रखना।",
  "analyze_usage_patterns": "ऐप के प्रदर्शन और विश्वसनीयता में सुधार के लिए उपयोग पैटर्न का विश्लेषण करना।",
  "welcome_intro": "आयु में आपका स्वागत है! आपकी गोपनीयता हमारे लिए महत्वपूर्ण है। यह गोपनीयता नीति बताती है कि जब आप हमारी सेवाओं का उपयोग करते हैं तो हम आपके व्यक्तिगत डेटा को कैसे एकत्र करते हैं, उसका उपयोग करते हैं और उसकी सुरक्षा करते हैं।"
,
"register_button": "रजिस्टर करें",
    // Register
    register: {
      prompt_fullname: "आपसे मिलकर अच्छा लगा!\nआपका नाम क्या है?",
      placeholder_fullname: "अपना नाम लिखें...",
      prompt_age: "बहुत बढ़िया!\nआपकी उम्र क्या है?",
      placeholder_age: "अपनी उम्र लिखें...",
      prompt_gender: "आपका लिंग क्या है?",
      prompt_phone: "लगभग हो गया!\nआपका WhatsApp नंबर क्या है?",
      placeholder_phone: "WhatsApp नंबर दर्ज करें"
    },
    // edit profile gender section
    male: "पुरुष",
    female: "महिला",
    prefer_not_to_say: "कहना नहीं चाहेंगे",
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
    // Support dot notation for nested keys (e.g. onboarding.title_1)
    const keys = key.split('.');
    let value: any = translations[language];
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    return typeof value === 'string' ? value : key;
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