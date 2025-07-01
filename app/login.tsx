import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as SecureStore from 'expo-secure-store';
import { useBackExit } from '@/hooks/useBackClick';
import { useAuthMutation } from "../hooks/useAuthMutation";
import InputField from '@/components/FormInput';
import { Controller, useForm } from 'react-hook-form';
import PhoneInput from '@/components/FormPhoneInput';



interface FormErrors {
  name ?: string;
  phone ?: string;
}

export default function LoginScreen() {
 
  const router = useRouter();
  const { mutate, isPending } = useAuthMutation('login');
  const { control, handleSubmit, formState: { errors } } = useForm();

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
    <View style={styles.container}>
      <Text style={styles.title} >Welcome Back!</Text>
      <Text style={styles.subtitle}>Log in to continue your journey with <Text style={{fontWeight: 'bold'}}>Aayu</Text>.</Text>

      <Controller
        control={control}
        name="phoneNumber"
        rules={{
          required: 'Phone number is required',
          minLength: { value: 10, message: 'Phone number must be at least 10 digits' },
        }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <Text style={[styles.label, { marginTop: hp('2%') }]}>WhatsApp Number <Text style={styles.required}>*</Text></Text>
            <View style={[styles.phoneContainer, error && styles.inputError]}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter your phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                maxLength={10}
                onChangeText={text => {
                  setAccountNotFound(false);
                  onChange(text);
                }}
                value={value}
              />
            </View>
            {error?.message && <Text style={styles.errorText}>{error.message}</Text>}
          </>
        )}
      />

      {/* Error messages: Only show one at a time */}
      {errors.phoneNumber ? (
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 0 }}>
        </Text>
      ) : accountNotFound ? (
        <Text style={{ color: 'red', textAlign: 'left', marginBottom: 10 }}>
          Account does not found. Continue to{' '}
          <Text
            style={{ color: 'red', fontWeight: 'bold' }}
            onPress={() => router.push('/register')}
          >
            Register
          </Text>
          .
        </Text>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={handleSubmit(handleLogin)}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.bottomText}>
        Don't have an account?{' '}
        <Text
          style={styles.link}
          onPress={() => router.push('/register')}
        >
          <Text style={{fontWeight: 'bold'}}>Register</Text>
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputError: {
    borderColor: 'red',
  },
  label: {
    fontWeight: '500',
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: wp('2%'),
    overflow: 'hidden',
    //marginBottom: 20
  },
  phoneInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? hp('1.5%') : hp('1%'),
    paddingHorizontal: wp('4%'),
    fontSize: wp('4%'),
    color: '#000',
  },
  countryCode: {
    paddingHorizontal: wp('4%'),
    paddingVertical: Platform.OS === 'ios' ? hp('1.5%') : hp('2%'),
    backgroundColor: '#f1f1f1',
    // borderRightWidth: 1,
    borderRadius: wp('1.5%'),

    borderRightColor: '#ccc',
    fontSize: wp('4%'),
    color: '#000',
  },
  
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  codeText: {
    fontSize: 16,
  },
  input: {
   // flex: 1,
   // backgroundColor: '#f2f2f2',
   // borderTopRightRadius: 8,
    //borderBottomRightRadius: 8,
    borderRadius: wp('1.5%'),

    borderColor: '#ccc',
    borderWidth: 1,   
    color: '#000',   
    marginBottom: 5,
   // borderRadius: wp('2%'),
    paddingVertical: Platform.OS === 'ios' ? hp('1.5%') : hp('1%'),
    paddingHorizontal: wp('4%'),
    fontSize: wp('4%'),
  },
  errorText: {
    color: 'red',
    marginBottom: 0,
    fontSize: 15,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  bottomText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: '#666',
  },
  link: {
    color: '#007BFF',
    fontWeight: '500',
  },
  required: {
    color: 'red',
    fontWeight: 'bold',
  },
});
