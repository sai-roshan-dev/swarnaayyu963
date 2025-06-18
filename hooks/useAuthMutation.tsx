// hooks/useAuthMutation.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { API_ENDPOINTS } from "../config/api";

type AuthParams = {
  phoneNumber: string;
  fullname?: string;
  age?: string;
  gender?: string;
  location?: string;
};

type AuthMode = "login" | "register";

export function useAuthMutation(mode: AuthMode) {
  return useMutation({
    mutationFn: async (params: AuthParams) => {
      console.log(params, 'check params')
      let data = {}
      if(mode === "login"){
         data = {
          "phone_number": `+91${params.phoneNumber}`
         }
      }else{
         data = {
          "phone_number": `+91${params.phoneNumber}`,
          "full_name": params.fullname,
          "age": parseInt(params.age || "0"),
          "gender": params.gender,
          "location": params.location
         }
      }

      const endpoint = mode === "login" ? API_ENDPOINTS.LOGIN : API_ENDPOINTS.REGISTER;
      const response = await axios.post(endpoint, data);
      return response.data;
    },
    onSuccess: (data) => {
      // You can store token or navigate here if needed
    },
    onError: (error: any) => {
    }
  });
}

type OTPParams = {
  phone_number: string;
  otp_code: string;
}

export function useOTPAuthMutation(mode: AuthMode) {
  return useMutation({
    mutationFn: async (params: OTPParams) => {
      // Remove any existing +91 prefix and add it back to ensure consistent format
      const cleanPhoneNumber = params.phone_number.replace(/^\+91/, '');
      const formattedPhoneNumber = `+${cleanPhoneNumber}`;

      console.log('OTP Verification Params:', {
        phone_number: formattedPhoneNumber,
        otp_code: params.otp_code
      });

      const response = await axios.post(API_ENDPOINTS.VERIFY_OTP, {
        phone_number: formattedPhoneNumber,
        otp_code: params.otp_code
      });
      return response.data; 
    },
    onSuccess: (data) => {
      console.log('OTP verification successful:', data);
    },
    onError: (error: AxiosError) => {
      console.error('OTP verification error:', error.response?.data || error.message);
    },
  });
}

