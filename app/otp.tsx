import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Keyboard,
  Image,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useOTPAuthMutation, useAuthMutation } from '@/hooks/useAuthMutation';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { ThemedText } from '@/components/ThemedText';


export default function OtpScreen() {
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const { phoneNumber } = useLocalSearchParams();
  const phone = Array.isArray(phoneNumber) ? phoneNumber[0] : phoneNumber;
  const router = useRouter();
  const { mutate } = useOTPAuthMutation('login');
  const { mutate: resendOtp, isPending: isResending } = useAuthMutation('login');
  const { t } = useLanguage();

  const [loginType, setLoginTypeUse] = useState('');

  console.log('phoneNumber in OTP:', phoneNumber); // Debug
  console.log('Normalized phone:', phone); // Debug

  const setLoginType = async () => {
    const type = await SecureStore.getItemAsync('loginType');
    if (type) setLoginTypeUse(type);
  };

  useEffect(() => {
    setLoginType();
  }, []);

  const handleChange = (text: string, index: number) => {
    if (/^\d$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      if (index < otp.length - 1) inputRefs.current[index + 1]?.focus();
      else Keyboard.dismiss();
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
    SecureStore.setItemAsync('isOtpVerified', code);

    const data = {
      phone_number: phone, // Use normalized phone
      otp_code: code,
    };

    console.log('Sending to mutate:', data); // Debug

    mutate(data, {
      onSuccess: async (res) => {
        try {
          await Promise.all([
            SecureStore.setItemAsync('token', res.access_token),
            SecureStore.setItemAsync('phone_number', res.user.phone_number),
            SecureStore.setItemAsync('name', res.user.full_name),
            SecureStore.setItemAsync('isLoggedIn', 'true'),
          ]);
          router.replace('/(app)');
        } catch (error) {
          Alert.alert('Error', 'Failed to complete login process');
        }
      },
      onError: (error: any) => {
        console.log('Mutation error:', error.response?.data, error.message); // Debug
        if (!error.response?.data?.exists) {
          Alert.alert(error.response?.data?.message || 'Invalid OTP');
        } else {
          Alert.alert('Something went wrong!!');
        }
      },
    });
  };

  const handleResendOtp = () => {
    console.log('Resending OTP for:', phone); // Debug
    resendOtp(
      { phoneNumber: phone }, // Use normalized phone
      {
        onSuccess: () => {
          Alert.alert('OTP resent!', 'A new OTP has been sent to your phone.');
        },
        onError: (error: any) => {
          console.log('Resend OTP error:', error.response?.data, error.message); // Debug
          Alert.alert('Error', 'Failed to resend OTP. Please try again.');
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Security icon */}
        <View style={styles.iconContainer}>
          <View style={styles.securityIcon}>
            <Image source={require('@/assets/images/otp-icon.png')} style={styles.securityIconImage} />
          </View>
        </View>

        {/* Title */}
        <ThemedText type="title" style={styles.title}>{t('enter_otp')}</ThemedText>

        {/* Subtitle */}
        <ThemedText type="subtitle" style={styles.subtitle}>
          Please enter the verification code sent to {phone}
        </ThemedText>

        {/* OTP Input Fields */}
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

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.verifyButton, otp.includes('') && styles.verifyButtonDisabled]}
          disabled={otp.includes('')}
          onPress={handleSubmit}
        >
          {otp.includes('') ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.verifyButtonText}>Verify</ThemedText>
          )}
        </TouchableOpacity>

        {/* Resend OTP */}
        <View style={styles.resendContainer}>
        <ThemedText style={styles.resendText}>
        Didn’t receive the OTP?{' '}
          <ThemedText
            style={styles.resendLink}
            onPress={isResending ? undefined : handleResendOtp}
          >
              {isResending ? t('resending') : 'Resend OTP'}
            </ThemedText>
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff' 
  },
  header: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  securityIcon: {
    position: 'relative',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityIconImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40, // Adjust as needed for circular image
  },
  circularArrows: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6c63ff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    width: '100%',
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    color: '#000000',
    backgroundColor: '#ffffff',
  },
  verifyButton: {
    backgroundColor: '#6c63ff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
    shadowColor: '#6c63ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  verifyButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333333',
  },
  resendLink: {
    color: '#6c63ff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  }
});