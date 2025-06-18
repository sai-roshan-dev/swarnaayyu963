import { useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

export const useAuthRedirect = () => {
  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        router.replace('/login');
      }
    };

    checkAuth();
  }, []);
};
