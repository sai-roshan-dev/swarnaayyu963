import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import { useAuthMutation } from "../hooks/useAuthMutation";
import InputField from '@/components/FormInput';
import { Controller, useForm } from 'react-hook-form';
import PhoneInput from '@/components/FormPhoneInput';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const staticCountryList = [
  { label: 'India', value: 'India' },
  { label: 'United States', value: 'United States' },
  { label: 'Brazil', value: 'Brazil' },
  { label: 'Australia', value: 'Australia' },
  { label: 'Canada', value: 'Canada' },
  { label: 'Germany', value: 'Germany' },
  { label: 'France', value: 'France' },
  { label: 'Japan', value: 'Japan' },
  { label: 'South Africa', value: 'South Africa' },
  { label: 'United Kingdom', value: 'United Kingdom' },
  { label: 'Italy', value: 'Italy' },
  { label: 'Mexico', value: 'Mexico' },
  { label: 'Russia', value: 'Russia' },
  { label: 'China', value: 'China' },
  { label: 'Argentina', value: 'Argentina' },
  { label: 'Turkey', value: 'Turkey' },
  { label: 'Egypt', value: 'Egypt' },
  { label: 'Spain', value: 'Spain' },
  { label: 'Indonesia', value: 'Indonesia' },
  { label: 'Nigeria', value: 'Nigeria' },
];

export default function RegisterScreen() {
  const { mutate, isPending } = useAuthMutation('register');
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullname: '',
      age: '',
      gender: '',
      location: '',
      phoneNumber: '',
    }
  });

  const router = useRouter();

  const handleRegister = (formData: any) => {
    const fullPhone = '91' + formData.phoneNumber;
    mutate(formData, {
      onSuccess: (response) => {
        Alert.alert('Registration Successful', `${response.message}`, [
          {
            text: 'OK',
            onPress: async () => {
              try {
                await axios.post('https://bot.swarnaayu.com/auth/login/', {
                  phone_number: `+${fullPhone}`
                });
              } catch (err) {
                Alert.alert('Notice', 'OTP may not have been sent automatically. Please try logging in if you do not receive an OTP.');
              }
              router.push({ pathname: '/otp', params: { phoneNumber: fullPhone } });
            }
          }
        ]);
      },
      onError: (error: any) => {
        console.error("Error:", error.response.data)
        if(!error.response.data.exists){
          Alert.alert("Account Already Exits")
        }else{
          Alert.alert("Something went wrong!!")
        }
      }
    })
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
          label="Name"
          placeholder="Enter your name"
          rules={{ required: 'Name is required' }}
          labelStyle={styles.label}
        />

        <InputField
          control={control}
          name="age"
          label="Age"
          placeholder="Enter your age"
          keyboardType="numeric"
          rules={{
            required: 'Age is required',
            pattern: {
              value: /^[0-9]{1,2}$/,
              message: 'Age must be a valid number with 2 digits',
            },
          }}
          labelStyle={styles.label}
        />

        <Text style={styles.label}>
          Gender <Text style={{ color: 'red' }}>*</Text>
        </Text>

        <Controller
          control={control}
          name="gender"
          rules={{ required: 'Please select a gender' }}
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
        {errors.gender && <Text style={[styles.errorText, {paddingBottom: 5}]}>{errors.gender.message}</Text>}

        <Text style={styles.label}>
          Country <Text style={{ color: 'red' }}>*</Text>
        </Text>
        <Controller
          control={control}
          name="location"
          rules={{ required: 'Country is required' }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View style={{ marginBottom: 12, borderWidth: 0.5, borderColor: error ? 'red' : '#999', borderRadius: 5 }}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={{ color: '#000', fontSize: 16 }}
              >
                <Picker.Item label="Select your country" value="" />
                {staticCountryList.map((country) => (
                  <Picker.Item key={country.value} label={country.label} value={country.value} />
                ))}
              </Picker>
              {error && <Text style={styles.errorText}>{error.message}</Text>}
            </View>
          )}
        />

        <PhoneInput
          control={control}
          name="phoneNumber"
          label="WhatsApp Number"
        />

        <TouchableOpacity 
          style={[styles.button, isPending && styles.buttonDisabled]} 
          onPress={handleSubmit(handleRegister)}
          disabled={isPending}
        >
          <Text style={styles.buttonText}>{isPending ? 'Registering...' : 'Register'}</Text>
        </TouchableOpacity>

        <Text style={styles.loginText} onPress={redirectLogin}>
          Already have an account? <Text style={styles.loginLink}>Login</Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    //paddingVertical: 24,
  },
  container: {
    flex: 1,
    paddingHorizontal: wp('10%'),
    justifyContent: 'center',
    backgroundColor: '#fff',
    //paddingTop: 10
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
    fontWeight: 'bold', // Make it bold
    marginBottom: hp('1%'),
    color: '#333', // Optional: darker for better readability
  },
  
  required: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: wp('2%'),
    paddingVertical: Platform.OS === 'ios' ? hp('1.5%') : hp('1%'),
    paddingHorizontal: wp('4%'),
    fontSize: wp('4%'),
    color: '#000',
    marginBottom: 5,
  },
  inputError: {
    borderColor: 'red',
  },

  
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: wp('2%'),
    overflow: 'hidden',
  },
  countryCode: {
    paddingHorizontal: wp('3%'),
    paddingVertical: Platform.OS === 'ios' ? hp('1.5%') : hp('2%'),
    backgroundColor: '#f1f1f1',
    // borderRightWidth: 1,
    borderRadius: wp('1.5%'),

    borderRightColor: '#ccc',
    fontSize: wp('4%'),
    color: '#000',
  },
  phoneInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? hp('1.5%') : hp('1%'),
    paddingHorizontal: wp('4%'),
    fontSize: wp('4%'),
    color: '#000',
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
  errorText: {
    color: 'red',
    fontSize: wp('3.5%'),
    marginTop: hp('0.5%'),
  },
  loginText: {
    marginTop: hp('3%'),
    textAlign: 'center',
    fontSize: wp('4%'),
    color: '#333',
    marginBottom: 20
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
    marginLeft: 5
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
