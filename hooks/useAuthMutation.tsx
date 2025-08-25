// hooks/useAuthMutation.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { API_ENDPOINTS } from "../config/api";

type AuthParams = {
  phoneNumber: string; // Should be full phone number with country code (e.g., "+916305517488")
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
          "phone_number": params.phoneNumber // Expects full phone number with country code
         }
      }else{
         data = {
          "phone_number": params.phoneNumber, // Expects full phone number with country code
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
  phone_number: string; // Should be full phone number with country code (e.g., "+916305517488")
  otp_code: string;
}

export function useOTPAuthMutation(mode: AuthMode) {
  return useMutation({
    mutationFn: async (params: OTPParams) => {
      console.log('OTP Verification Params:', {
        phone_number: params.phone_number,
        otp_code: params.otp_code
      });

      const response = await axios.post(API_ENDPOINTS.VERIFY_OTP, {
        phone_number: params.phone_number, // Use phone number as provided
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

