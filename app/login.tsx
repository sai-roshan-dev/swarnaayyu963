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


  useBackExit();

  const handleLogin = (data: any) => {

    const {name, phoneNumber } = data;
    const fullPhone = '91' + phoneNumber;
    SecureStore.setItemAsync('loginType', 'login');

     mutate(data,{
      onSuccess: (data) => {
       router.push({ pathname: '/otp', params: { phoneNumber: fullPhone } });
      },
      onError: (error: any) => {
        console.log(error.response.data, 'checking login')
        if(!error.response.data.exists){
          Alert.alert(
            'Account not Exists',
            'Press proceed to register',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Proceed',
                onPress: () => {
                  router.push({ pathname: '/register', params: { phoneNumber: fullPhone } });
                },
              },
            ]
          );
        }else{
          Alert.alert('Login Alert', `Something went wrong!!`, [
            { text: 'OK', style: 'cancel' },
          ]);
        }
      }
        ,
    })
   
    
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title} >Welcome Back!</Text>
      <Text style={styles.subtitle}>Log in to continue your journey with <Text style={{fontWeight: 'bold'}}>Aayu</Text>.</Text>

      <PhoneInput
        control={control}
        name="phoneNumber"
        label="WhatsApp Number"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit(handleLogin)}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.bottomText}>
        Don't have an account?{' '}
        <Text
          style={styles.link}
          onPress={() => router.push('/register')}
        >
          Join us now!
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
    marginBottom: 12,
    fontSize: 13,
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


});
