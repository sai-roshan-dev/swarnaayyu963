import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import { useAuthMutation } from '../hooks/useAuthMutation';
import InputField from '@/components/FormInput';
import { Controller, useForm } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { ThemedText } from '@/components/ThemedText';
import CountryPicker, { Country } from 'react-native-country-picker-modal';
import axios from 'axios';

export default function RegisterScreen() {
  const { mutate, isPending } = useAuthMutation('register');
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullname: '',
      age: '',
      gender: '',
      location: '',
      phoneNumber: '',
    },
  });

  const [accountExists, setAccountExists] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const [country, setCountry] = useState<Country | null>(null);
  const [countryCode, setCountryCode] = useState('+91'); // Default to India
  const [cca2, setCca2] = useState<Country['cca2']>('IN'); // or your default
  const [showPicker, setShowPicker] = useState(false);

  const handleRegister = (formData: any) => {
    const fullPhone = countryCode.replace('+', '') + formData.phoneNumber;
    setAccountExists(false);
    mutate(formData, {
      onSuccess: (response) => {
        Alert.alert('Registration Successful', `${response.message}`, [
          {
            text: 'OK',
            onPress: async () => {
              try {
                await axios.post('https://bot.swarnaayu.com/auth/login/', {
                  phone_number: `+${fullPhone}`,
                });
              } catch (err) {
                Alert.alert('Notice', 'OTP may not have been sent automatically. Please try logging in if you do not receive an OTP.');
              }
              router.push({ pathname: '/otp', params: { phoneNumber: fullPhone } });
            },
          },
        ]);
      },
      onError: (error: any) => {
        console.error('Error:', error.response.data);
        if (!error.response.data.exists) {
          setAccountExists(true);
        } else {
          Alert.alert('Something went wrong!!');
        }
      },
    });
  };

  const redirectLogin = () => {
    router.replace('/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Get Started with {"\n"}<Text style={styles.brand}>Aayu</Text></Text>
        <Text style={styles.subtitle}>
          I'm always here for talk—anytime, anywhere.
        </Text>

        <InputField
          control={control}
          name="fullname"
          label={t('name')}
          placeholder={t('enter_name')}
          rules={{ required: t('name_required') }}
          labelStyle={styles.label}
        />

        <InputField
          control={control}
          name="age"
          label={t('age')}
          placeholder={t('enter_age')}
          keyboardType="numeric"
          rules={{
            required: t('age_required'),
            pattern: {
              value: /^[0-9]{1,2}$/,
              message: t('age_valid'),
            },
          }}
          labelStyle={styles.label}
        />

        <Text style={styles.label}>
          {t('gender')} <Text style={{ color: 'red' }}>*</Text>
        </Text>
        <Controller
          control={control}
          name="gender"
          rules={{ required: t('gender_required') }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.radioGroup}>
              {['Male', 'Female', 'Other'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.radioOption}
                  onPress={() => onChange(option)}
                >
                  <View style={styles.radioCircle}>
                    {value === option && <View style={styles.selectedRadio} />}
                  </View>
                  <Text style={styles.radioLabel}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
        {errors.gender && <Text style={[styles.errorText, { paddingBottom: 5 }]}>{errors.gender.message}</Text>}

        <Text style={styles.label}>
          {t('whatsapp_number')} <Text style={{ color: 'red' }}>*</Text>
        </Text>
        <View style={[styles.phoneContainer, errors.phoneNumber && styles.inputError]}>
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
          <Controller
            control={control}
            name="phoneNumber"
            rules={{
              required: t('phone_required'),
              minLength: { value: 8, message: t('phone_digits') },
            }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TextInput
                style={styles.phoneInput}
                placeholder={t('enter_phone')}
                placeholderTextColor="#b3aefc"
                keyboardType="phone-pad"
                maxLength={15}
                onChangeText={text => {
                  setAccountExists(false);
                  onChange(text);
                }}
                value={value}
              />
            )}
          />
        </View>
        {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber.message}</Text>}

        {accountExists && (
          <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>
            {t('account_exists')}. {t('continue_to')}{' '}
            <ThemedText
              style={{ color: '#e53935', fontWeight: 'bold', textDecorationLine: 'underline' }}
              onPress={() => router.push('/login')}
            >
              {t('login')}
            </ThemedText>
            .
          </Text>
        )}
        <TouchableOpacity
          style={[styles.button, isPending && styles.buttonDisabled]}
          onPress={handleSubmit(handleRegister)}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isPending ? 'Registering...' : t('register')}</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.loginText} onPress={redirectLogin}>
          {t('already_have_account')}{' '}
          <Text style={styles.loginLink}><Text style={{ fontWeight: 'bold' }}>{t('login')}</Text></Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: wp('10%'),
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: wp('6.5%'),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: hp('1%'),
    color: '#000',
  },
  brand: {
    color: '#000',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: wp('4%'),
    color: '#666',
    textAlign: 'center',
    marginBottom: hp('4%'),
  },
  label: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    marginBottom: hp('1%'),
    color: '#333',
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
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: wp('3.5%'),
    marginTop: hp('0.5%'),
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: hp('1.8%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    marginTop: hp('4%'),
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: wp('4.5%'),
    fontWeight: '600',
  },
  loginText: {
    marginTop: hp('3%'),
    textAlign: 'center',
    fontSize: wp('4%'),
    color: '#333',
    marginBottom: 20,
  },
  loginLink: {
    color: '#007BFF',
    fontWeight: '500',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007BFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  selectedRadio: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#007BFF',
  },
  radioLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});