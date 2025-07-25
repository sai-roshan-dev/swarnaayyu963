import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useOTPAuthMutation } from '@/hooks/useAuthMutation';
import { useAuthMutation } from '../hooks/useAuthMutation';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { ThemedText } from '@/components/ThemedText';

export default function OtpScreen() {
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const { phoneNumber } = useLocalSearchParams();
  const router = useRouter();
  const { mutate } = useOTPAuthMutation('login');
  const { mutate: resendOtp, isPending: isResending } = useAuthMutation('login');
  const { t } = useLanguage();

  const [loginType, setLoginTypeUse] = useState('');

  const setLoginType = async () => {
    const loginType = await SecureStore.getItemAsync('loginType');
    if (loginType) {
      setLoginTypeUse(loginType);
    }
  };

  useEffect(() => {
    setLoginType();
  }, []);

  const fullPhone = phoneNumber?.toString().startsWith('+91')
    ? phoneNumber
    : `+91${phoneNumber}`;

  const handleChange = (text: string, index: number) => {
    if (/^\d$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      if (index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else {
        Keyboard.dismiss();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      const newOtp = [...otp];

      if (otp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleSubmit = () => {
    const code = otp.join('');
    console.log('OTP Entered:', code);
    SecureStore.setItemAsync('isOtpVerified', code);

    const cleanPhoneNumber = phoneNumber?.toString().replace(/^\+91/, '');

    const data = {
      phone_number: `+91${cleanPhoneNumber}`,
      otp_code: code,
    };
    mutate(data, {
      onSuccess: async (data) => {
        try {
          await Promise.all([
            SecureStore.setItemAsync('token', data.access_token),
            SecureStore.setItemAsync('phone_number', data.user.phone_number),
            SecureStore.setItemAsync('name', data.user.full_name),
            SecureStore.setItemAsync('isLoggedIn', 'true'),
          ]);

          console.log('Navigation to main screen...');
          router.replace('/(app)');
        } catch (error) {
          console.error('Error storing data:', error);
          Alert.alert('Error', 'Failed to complete login process');
        }
      },
      onError: (error: any) => {
        console.error('OTP verification error:', error);
        if (!error.response.data.exists) {
          Alert.alert(error.response.data.message);
        } else {
          Alert.alert('Something went wrong!!');
        }
      },
    });
  };

  const handleResendOtp = () => {
    const phone = Array.isArray(phoneNumber) ? phoneNumber[0] : phoneNumber;
    const rawPhone = phone.replace(/^\+?91/, '');
    resendOtp(
      { phoneNumber: rawPhone },
      {
        onSuccess: () => {
          Alert.alert('OTP resent!', 'A new OTP has been sent to your phone.');
        },
        onError: () => {
          Alert.alert('Error', 'Failed to resend OTP. Please try again.');
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Purple Header */}
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>{t('enter_otp')}</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          {t('otp_sent_to')} {phoneNumber}
        </ThemedText>
      </View>
      {/* White Card */}
      <View style={styles.card}>
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={styles.otpInput}
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              autoFocus={index === 0}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            otp.includes('') && { backgroundColor: '#ddd' },
          ]}
          disabled={otp.includes('')}
          onPress={handleSubmit}
        >
          {otp.includes('') ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>{t('continue')}</ThemedText>
          )}
        </TouchableOpacity>

        <ThemedText style={styles.resendText}>
          {t('didnt_receive_code')}{' '}
          <ThemedText
            style={styles.resendLink}
            onPress={isResending ? undefined : handleResendOtp}
          >
            {isResending ? t('resending') : t('resend_code')}
          </ThemedText>
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6c63ff',
  },
  topSection: {
    backgroundColor: '#6c63ff',
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
    paddingTop: 100,
    paddingBottom: 200,
    shadowColor: '#000',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('4%'),
  },
  otpInput: {
    width: wp('12%'),
    height: wp('14%'),
    borderWidth: 1.5,
    borderColor: '#a99af7',
    borderRadius: wp('2%'),
    textAlign: 'center',
    fontSize: wp('6%'),
    color: '#000',
  },
  button: {
    backgroundColor: '#6c63ff',
    paddingVertical: hp('1.8%'),
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#6c63ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: wp('4.5%'),
    fontWeight: '700',
  },
  resendText: {
    textAlign: 'center',
    marginTop: hp('3%'),
    fontSize: wp('4%'),
    color: '#222',
  },
  resendLink: {
    color: '#6c63ff',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});