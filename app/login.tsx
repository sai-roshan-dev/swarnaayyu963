import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as SecureStore from 'expo-secure-store';
import { useBackExit } from '@/hooks/useBackClick';
import { useAuthMutation } from "../hooks/useAuthMutation";
import InputField from '@/components/FormInput';
import { Controller, useForm } from 'react-hook-form';
import PhoneInput from '@/components/FormPhoneInput';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { ThemedText } from '@/components/ThemedText';


interface FormErrors {
  name ?: string;
  phone ?: string;
}

export default function LoginScreen() {
 
  const router = useRouter();
  const { mutate, isPending } = useAuthMutation('login');
  const { control, handleSubmit, formState: { errors } } = useForm();
  const { t } = useLanguage();

  const [accountNotFound, setAccountNotFound] = useState(false);

  useBackExit();

  const handleLogin = (data: any) => {
    const {name, phoneNumber } = data;
    const fullPhone = '91' + phoneNumber;
    SecureStore.setItemAsync('loginType', 'login');
    setAccountNotFound(false);
    mutate(data,{
      onSuccess: (data) => {
        router.push({ pathname: '/otp', params: { phoneNumber: fullPhone } });
      },
      onError: (error: any) => {
        console.log(error.response.data, 'checking login')
        if(!error.response.data.exists){
          setAccountNotFound(true);
        }else{
          Alert.alert('Login Alert', `Something went wrong!!`, [
            { text: 'OK', style: 'cancel' },
          ]);
        }
      }
    })
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Top Purple Header */}
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>{t('welcome')}</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>{t('login_subtitle')}</ThemedText>
      </View>
      {/* White Card */}
      <View style={styles.card}>
        <Controller
          control={control}
          name="phoneNumber"
          rules={{
            required: t('phone_required'),
            minLength: { value: 10, message: t('phone_digits') },
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <ThemedText style={styles.label}>{t('whatsapp_number')}</ThemedText>
              <View style={[styles.phoneContainer, error && styles.inputError]}>
                <View style={styles.countryCodeBox}>
                  <ThemedText style={styles.countryCodeText}>+91</ThemedText>
                  <Ionicons name="chevron-down" size={16} color="#6c63ff" style={{ marginLeft: 2 }} />
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder={t('enter_phone')}
                  placeholderTextColor="#b3aefc"
                  keyboardType="phone-pad"
                  maxLength={10}
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
        {/* Error messages: Only show one at a time */}
        {errors.phoneNumber ? (
          <ThemedText style={{ color: 'red', textAlign: 'center', marginBottom: 0 }}></ThemedText>
        ) : accountNotFound ? (
          <ThemedText style={{ color: 'red', textAlign: 'left', marginBottom: 10 }}>
            {t('account_exists')}. {t('continue_to')}{' '}
            <ThemedText
              style={{ color: '#e53935', fontWeight: 'bold', textDecorationLine: 'underline' }}
              onPress={() => router.push('/register')}
            >
              {t('register')}
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
            {t('register')}
          </ThemedText>
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topSection: {
    backgroundColor: '#6c63ff',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 48,
    paddingBottom: 40,
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 52,
    zIndex: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#e6e6fa',
    textAlign: 'center',
    marginBottom: 0,
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: -40,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
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
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f2fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#a99af7',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#6c63ff',
    fontWeight: '700',
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
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
    fontSize: 20,
  },
  bottomText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 15,
    color: '#222',
  },
  link: {
    color: '#6c63ff',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
