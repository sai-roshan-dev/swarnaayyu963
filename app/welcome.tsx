import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthRedirect } from '@/hooks/useAuthCheck';

export default function WelcomeScreen() {
      const router = useRouter();
      useAuthRedirect()

     useEffect(() => {
        const timer = setTimeout(() => {
          router.replace('/'); 
        }, 2000);
    
        return () => clearTimeout(timer);
      }, []);
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name="checkmark" size={36} color="#fff" />
      </View>
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>You're successfully logged in</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
});
