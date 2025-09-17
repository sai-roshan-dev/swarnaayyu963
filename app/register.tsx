import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  TextInputProps,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthMutation } from '../hooks/useAuthMutation';
import { Controller, useForm } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import CountryPicker, { Country } from 'react-native-country-picker-modal';
import axios from 'axios';

// Default form values
const defaultValues = {
  fullname: '',
  age: '',
  gender: '',
  phoneNumber: '',
};

export default function RegisterScreen() {
  const { mutate, isPending } = useAuthMutation('register');
  const { t } = useLanguage();
  const router = useRouter();

  // Define input fields
  const FIELDS: Array<{
    key: keyof typeof defaultValues;
    prompt: string;
    placeholder?: string;
    keyboardType?: TextInputProps['keyboardType'];
    required?: boolean;
    type?: 'select';
    options?: string[];
    buttonText?: string;
  }> = [
    { key: 'fullname', prompt: t('register.prompt_fullname'), placeholder: t('register.placeholder_fullname'), keyboardType: 'default', required: true, buttonText: t('next') },
    { key: 'age', prompt: t('register.prompt_age'), placeholder: t('register.placeholder_age'), keyboardType: 'numeric', required: true, buttonText: t('next') },
    { key: 'gender', prompt: t('register.prompt_gender'), type: 'select', options: [t('male'), t('female'), t('prefer_not_to_say')], required: true, buttonText: t('next') },
    { key: 'phoneNumber', prompt: t('register.prompt_phone'), placeholder: t('register.placeholder_phone'), keyboardType: 'phone-pad', required: true, buttonText: t('register_button') },
  ];

  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues,
  });

  const [step, setStep] = useState(0);
  const [country, setCountry] = useState<Country | null>(null);
  const [countryCode, setCountryCode] = useState('+91');
  const [cca2, setCca2] = useState<Country['cca2']>('IN');
  const [showPicker, setShowPicker] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [accountExists, setAccountExists] = useState(false);

  // Clear current field on step change
  useEffect(() => {
    const field = FIELDS[step];
    setValue(field.key, '');
    setErrorMsg('');
  }, [step, setValue]);

  const handleNext = (data: any) => {
    setErrorMsg('');
    const field = FIELDS[step];
    const value = data[field.key];

    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      setErrorMsg(t('error.field_required'));
      return;
    }

    if (field.key === 'fullname') {
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!nameRegex.test(value)) {
        setErrorMsg(t('error.invalid_name'));
        return;
      }
    }

    if (field.key === 'age' && (isNaN(Number(value)) || Number(value) < 1 || Number(value) > 120)) {
      setErrorMsg(t('error.invalid_age'));
      return;
    }

    if (field.key === 'phoneNumber' && value.replace(/\D/g, '').length < 8) {
      setErrorMsg(t('error.invalid_phone'));
      return;
    }

    // Increment step safely
    setStep((prev) => Math.min(prev + 1, FIELDS.length - 1));
  };

  const handleBack = () => {
    setErrorMsg('');
    if (step === 0) {
      router.back();
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const onSubmit = async (formData: any) => {
    const fullPhone = `${countryCode}${formData.phoneNumber}`;
    setAccountExists(false);

    const registrationData = {
      ...formData,
      phoneNumber: fullPhone,
    };

    mutate(registrationData, {
      onSuccess: (response) => {
        Alert.alert(t('alert.registration_successful'), response.message, [
          {
            text: t('ok'),
            onPress: async () => {
              try {
                await axios.post('https://bot.swarnaayu.com/auth/login/', {
                  phone_number: fullPhone,
                });
              } catch {
                Alert.alert(t('alert.notice'), t('alert.otp_not_sent'));
              }
              router.push({ pathname: '/otp', params: { phoneNumber: fullPhone } });
            },
          },
        ]);
      },
      onError: (error: any) => {
        if (error.response?.data?.exists) {
          setAccountExists(true);
        } else {
          Alert.alert(t('error.something_went_wrong'));
        }
      },
    });
  };

  const field = FIELDS[step];
  const isLastStep = step === FIELDS.length - 1;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          <View style={styles.progressContainer}>
            {FIELDS.map((_, idx) => (
              <View key={idx} style={[styles.progressDot, idx <= step ? styles.progressDotActive : null]} />
            ))}
          </View>

          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={30} color="#000" />
          </TouchableOpacity>

          <View style={styles.centeredContent}>
            <Text style={styles.prompt}>{field.prompt}</Text>

            {field.type === 'select' ? (
              <Controller
                control={control}
                name={field.key as 'gender'}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <View style={styles.radioGroup}>
                    {field.options?.map((option: string) => (
                      <TouchableOpacity
                        key={option}
                        style={styles.radioOption}
                        onPress={() => onChange(option)}
                      >
                        <View style={[styles.radioCircle, value === option && styles.radioCircleSelected]}>
                          {value === option && <View style={styles.radioDot} />}
                        </View>
                        <Text style={[styles.radioLabel, value === option && styles.radioLabelSelected]}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
            ) : field.key === 'phoneNumber' ? (
              <View style={styles.phoneRow}>
                <TouchableOpacity style={styles.countryCodeBox} onPress={() => setShowPicker(true)}>
                  <Text style={styles.countryCodeText}>{country ? `+${country.callingCode?.[0] ?? '91'}` : countryCode}</Text>
                  <Ionicons name="chevron-down" size={16} color="#6c63ff" style={{ marginLeft: 2 }} />
                </TouchableOpacity>
                <CountryPicker
                  withFilter
                  withFlag
                  withCallingCode
                  withCountryNameButton={false}
                  withEmoji
                  onSelect={(country) => {
                    setCountryCode('+' + country.callingCode?.[0] ?? '91');
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
                  rules={{ required: true, minLength: 8 }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.phoneInput}
                      placeholder={field.placeholder}
                      placeholderTextColor="#b3aefc"
                      keyboardType={field.keyboardType}
                      maxLength={15}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
            ) : (
              <Controller
                control={control}
                name={field.key as 'fullname' | 'age'}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder={field.placeholder}
                    placeholderTextColor="#b3aefc"
                    keyboardType={field.keyboardType}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            )}

            {errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null}

            {accountExists && (
              <Text style={styles.accountExistsText}>
                {t('account_exists')}. {t('continue_to')}{' '}
                <Text style={styles.loginLink} onPress={() => router.push('/login')}>
                  {t('login')}
                </Text>
                .
              </Text>
            )}
          </View>

          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              style={[styles.button, isPending && styles.buttonDisabled]}
              onPress={isLastStep ? handleSubmit(onSubmit) : handleSubmit(handleNext)}
              disabled={isPending}
            >
              {isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{field.buttonText}</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#6c63ff',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 29,
    zIndex: 2,
  },
  prompt: {
    fontSize: 27,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
    marginBottom: 50,
    marginTop: -80,
    lineHeight: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#6c63ff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 18,
    color: '#222',
    marginBottom: 24,
    backgroundColor: '#fff',
    width: 320,
    alignSelf: 'center',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    width: 320,
    alignSelf: 'center',
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#6c63ff',
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: '#f7f7ff',
    height: 56,
  },
  countryCodeText: {
    fontSize: 18,
    color: '#6c63ff',
    fontWeight: '700',
    marginRight: 5,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#222',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#6c63ff',
    borderRadius: 12,
    height: 56,
  },
  radioGroup: {
    width: 320,
    alignSelf: 'center',
    marginBottom: 24,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  radioCircle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: '#6c63ff',
  },
  radioDot: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#6c63ff',
  },
  radioLabel: {
    fontSize: 18,
    color: '#222',
    fontWeight: '400',
  },
  radioLabelSelected: {
    color: '#6c63ff',
    fontWeight: '700',
  },
  bottomButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 32,
    paddingHorizontal: 24,
  },
  button: {
    backgroundColor: '#564CF3',
    paddingVertical: 20,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#564CF3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  errorMsg: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 15,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  accountExistsText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 30,
  },
  loginLink: {
    color: '#e53935',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
