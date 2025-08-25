import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, BackHandler, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as SecureStore from 'expo-secure-store';
import { useBackExit } from '@/hooks/useBackClick';
import { useAuthMutation } from '@/hooks/useAuthMutation';
import { Controller, useForm } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { ThemedText } from '@/components/ThemedText';
import CountryPicker, { Country } from 'react-native-country-picker-modal';

export default function LoginScreen() {
  const router = useRouter();
  const { mutate, isPending } = useAuthMutation('login');
  const { control, handleSubmit, formState: { errors } } = useForm();
  const { t } = useLanguage();

  const [accountNotFound, setAccountNotFound] = useState(false);
  const [country, setCountry] = useState<Country | null>(null);
  const [countryCode, setCountryCode] = useState('+91'); // Default to +91 (India)
  const [cca2, setCca2] = useState<Country['cca2']>('IN'); // Default to India
  const [showPicker, setShowPicker] = useState(false);

  useBackExit();

  const handleBackPress = () => {
    BackHandler.exitApp();
  };

  const handleLogin = (data: any) => {
    const { phoneNumber } = data;
    const fullPhone = `${countryCode}${phoneNumber}`;
    
    console.log('phoneNumber in login:', phoneNumber); // Debug: Should log 6305517488
    console.log('fullPhone in login:', fullPhone); // Debug: Should log +916305517488
    SecureStore.setItemAsync('loginType', 'login');
    SecureStore.setItemAsync('fullPhone', fullPhone); // Save for fallback
    setAccountNotFound(false);
    mutate({ phoneNumber: fullPhone }, { // Send fullPhone instead of data
      onSuccess: (response) => {
        console.log('Mutation success, params:', { phoneNumber: fullPhone }); // Debug
        router.push({ pathname: '/otp', params: { phoneNumber: String(fullPhone) } });
      },
      onError: (error: any) => {
        console.log('Mutation error:', error.response?.data, error.message); // Debug
        if (!error.response?.data?.exists) {
          setAccountNotFound(true);
        } else {
          Alert.alert('Login Alert', `Something went wrong!!`, [
            { text: 'OK', style: 'cancel' },
          ]);
        }
      }
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, backgroundColor: '#6c63ff' }}>
        {/* Top Purple Header */}
        <View style={styles.topSection}>
          {Platform.OS === 'android' && (
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Ionicons name="chevron-back" size={30} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <ThemedText type="title" style={styles.title}>{t('welcome')}</ThemedText>
          <ThemedText type="subtitle" style={styles.subtitle}>{t('login_subtitle')}</ThemedText>
        </View>
        {/* White Card */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={styles.card}>
            <Controller
              control={control}
              name="phoneNumber"
              rules={{
                required: t('phone_required'),
                minLength: { value: 8, message: t('phone_digits') },
              }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <>
                  <ThemedText style={styles.label}>{t('whatsapp_number')}</ThemedText>
                  <View style={[styles.phoneContainer, error && styles.inputError]}>
                    <TouchableOpacity
                      style={styles.countryCodeBox}
                      onPress={() => setShowPicker(true)}
                    >
                      <ThemedText style={styles.countryCodeText}>
                        {country ? `+${country.callingCode[0]}` : countryCode}
                      </ThemedText>
                      <Ionicons name="chevron-down" size={16} color="#6c63ff" style={{ marginLeft: 2 }} />
                    </TouchableOpacity>
                    <CountryPicker
                      withFilter
                      withFlag
                      withCallingCode
                      withCountryNameButton={false}
                      withEmoji
                      onSelect={(country) => {
                        setCountryCode('+' + country.callingCode[0]);
                        setCca2(country.cca2);
                        setCountry(country);
                        setShowPicker(false);
                      }}
                      visible={showPicker}
                      onClose={() => setShowPicker(false)}
                      countryCode={cca2}
                      theme={{
                        onBackgroundTextColor: '#222',
                        backgroundColor: '#fff',
                        primaryColor: '#6c63ff',
                      }}
                    />
                    <TextInput
                      style={styles.phoneInput}
                      placeholder={t('enter_phone')}
                      placeholderTextColor="#b3aefc"
                      keyboardType="phone-pad"
                      maxLength={15}
                      onChangeText={text => {
                        setAccountNotFound(false);
                        onChange(text);
                      }}
                      value={value}
                    />
                  </View>
                  {error?.message && <ThemedText style={styles.errorText}>{error.message}</ThemedText>}
                </>
              )}
            />
            {errors.phoneNumber ? (
              <ThemedText style={{ color: 'red', textAlign: 'center', marginBottom: 0 }}></ThemedText>
            ) : accountNotFound ? (
              <ThemedText style={{ color: 'red', textAlign: 'left', marginBottom: 10 }}>
                {t('account_exists')}. {t('continue_to')}{' '}
                <ThemedText
                  style={{ color: '#e53935', fontWeight: 'bold', textDecorationLine: 'underline' }}
                  onPress={() => router.push('/register')}
                >
                  {t('Register')}
                </ThemedText>
                .
              </ThemedText>
            ) : null}
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit(handleLogin)}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>{t('login')}</ThemedText>
              )}
            </TouchableOpacity>
            <ThemedText style={styles.bottomText}>
              {t('dont_have_account')}{' '}
              <ThemedText
                style={styles.link}
                onPress={() => router.push('/register')}
              >
                {t('Register')}
              </ThemedText>
            </ThemedText>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  topSection: {
    backgroundColor: '#6c63ff',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: 48,
    paddingBottom: 100,
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 21,
    zIndex: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    borderTopWidth: 10,
    borderTopColor: '#6c63ff',
    marginTop: 50,
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 500,
    color: '#e6e6fa',
    textAlign: 'center',
    marginBottom: 0,
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginHorizontal: 0,
    marginTop: 0,
    padding: 24,
    paddingTop: 30,
    paddingBottom: 500,
    shadowColor: '#000',
  },
  label: {
    fontWeight: '700',
    fontSize: 16,
    color: '#111',
    marginBottom: 10,
    marginLeft: 2,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#a99af7',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 18,
    backgroundColor: '#fff',
    height: hp('6%'),
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: '#a99af7',
    backgroundColor: 'transparent',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#6c63ff',
    fontWeight: '700',
    marginRight: 5,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 0,
    fontSize: 14,
    color: '#222',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 0,
    fontSize: 15,
  },
  button: {
    backgroundColor: '#6c63ff',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    borderTopWidth:5,
    borderTopColor: '#6c63ff',
    fontSize: 20,
  },
  bottomText: {
    textAlign: 'center',
    marginTop: 1,
    fontSize: 15,
    color: '#222',
  },
  link: {
    color: '#6c63ff',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});