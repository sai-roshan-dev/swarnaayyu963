import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
  Alert,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useOTPAuthMutation } from '@/hooks/useAuthMutation';
import { useAuthMutation } from '../hooks/useAuthMutation';


export default  function OtpScreen() {
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const { phoneNumber } = useLocalSearchParams();
  const router = useRouter();
  const { mutate } = useOTPAuthMutation('login')
  const { mutate: resendOtp, isPending: isResending } = useAuthMutation('login');

  const [loginType, setLoginTypeUse] = useState(''); 

  const setLoginType = async() =>{
    const loginType = await SecureStore.getItemAsync('loginType');
    if(loginType){
      setLoginTypeUse(loginType);
    }
  }

  useEffect(()=>{
    setLoginType();
  },[])

  // Make sure you have the phone number available as fullPhone
  const fullPhone = phoneNumber?.toString().startsWith('+91')
    ? phoneNumber
    : `+91${phoneNumber}`;

  const handleChange = (text: string, index: number) => {
    if (/^\d$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Move to next input if not last
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
    
    // Remove any existing +91 prefix from phoneNumber if present
    const cleanPhoneNumber = phoneNumber?.toString().replace(/^\+91/, '');
    
    const data = {
      "phone_number": `+91${cleanPhoneNumber}`,
      "otp_code": code
    }
    mutate(data, {
      onSuccess: async (data) => {
        try {
          // Store all necessary data
          await Promise.all([
            SecureStore.setItemAsync('token', data.access_token),
            SecureStore.setItemAsync('phone_number', data.user.phone_number),
            SecureStore.setItemAsync('name', data.user.full_name),
            SecureStore.setItemAsync('isLoggedIn', 'true')
          ]);
          
          console.log('Navigation to main screen...');
          // Navigate to the main app index
          router.replace('/(app)');
        } catch (error) {
          console.error('Error storing data:', error);
          Alert.alert('Error', 'Failed to complete login process');
        }
      },
      onError: (error: any) => {
        console.error('OTP verification error:', error);
        if(!error.response.data.exists){
          Alert.alert(error.response.data.message)
        }else{
          Alert.alert("Something went wrong!!")
        }
      }
    })
  };

  // Helper to extract 10-digit number
  const getRawPhoneNumber = (phone: string) => {
    // Remove any leading + or country code
    return phone.replace(/^\+?91/, '');
  };

  const handleResendOtp = () => {
    const phone = Array.isArray(phoneNumber) ? phoneNumber[0] : phoneNumber;
    const rawPhone = getRawPhoneNumber(phone); // phoneNumber from params
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
      <Text style={styles.title}>Enter OTP Code</Text>
      <Text style={styles.subtitle}>
      Enter the OTP code sent to {phoneNumber}
      </Text>

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
          styles.continueButton,
          otp.includes('') && { backgroundColor: '#ddd' },
        ]}
        disabled={otp.includes('')}
        onPress={handleSubmit}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>

      <Text style={styles.resendText}>
        Didn't receive the code?{' '}
        <Text
          style={styles.resendLink}
          onPress={isResending ? undefined : handleResendOtp}
        >
          {isResending ? 'Resending...' : 'Resend code'}
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp('6%'),
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  backArrow: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? hp('6%') : hp('4%'),
    left: wp('4%'),
  },
  backText: {
    fontSize: wp('6%'),
    color: '#000',
  },
  title: {
    fontSize: wp('6%'),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: hp('1%'),
    color: '#000',
  },
  subtitle: {
    fontSize: wp('4%'),
    color: '#666',
    textAlign: 'center',
    marginBottom: hp('5%'),
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('4%'),
  },
  otpInput: {
    width: wp('12%'),
    height: wp('14%'),
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('2%'),
    textAlign: 'center',
    fontSize: wp('6%'),
    color: '#000',
  },
  continueButton: {
    backgroundColor: '#007BFF',
    paddingVertical: hp('1.8%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  continueText: {
    color: '#fff',
    fontSize: wp('4.5%'),
    fontWeight: '600',
  },
  resendText: {
    textAlign: 'center',
    marginTop: hp('3%'),
    fontSize: wp('4%'),
    color: '#333',
  },
  resendLink: {
    color: '#007BFF',
    fontWeight: '500',
  },
});
