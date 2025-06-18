import React from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { Controller } from 'react-hook-form';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

interface PhoneInputProps {
  control: any;
  name: string;
  label: string;
  requiredMessage?: string;
}

export default function PhoneInput({
  control,
  name,
  label,
  requiredMessage = 'Phone number is required',
}: PhoneInputProps) {
  return (
    <>
      <Text style={[styles.label, { marginTop: hp('2%') }]}>
        {label} <Text style={styles.required}>*</Text>
      </Text>

      <Controller
        control={control}
        name={name}
        rules={{
          required: requiredMessage,
          minLength: { value: 10, message: 'Phone number must be at least 10 digits' },
        }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <View style={[styles.phoneContainer, error && styles.inputError]}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter your phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                maxLength={10}
                onChangeText={onChange}
                value={value}
              />
            </View>
            {error?.message && <Text style={styles.errorText}>{error.message}</Text>}
          </>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: '500',
    marginBottom: 8,
    fontSize: wp('4%'),
  },
  required: {
    color: 'red',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: wp('2%'),
    overflow: 'hidden',
    marginBottom: 12,
  },
  countryCode: {
    paddingHorizontal: wp('4%'),
    paddingVertical: Platform.OS === 'ios' ? hp('1.5%') : hp('2%'),
    backgroundColor: '#f1f1f1',
    borderRadius: wp('1.5%'),
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
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginTop: 4,
  },
});
