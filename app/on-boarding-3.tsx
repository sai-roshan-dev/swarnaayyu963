// app/on-boarding-3.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export const screenOptions = {
  headerShown: false,
};

export default function OnBoarding3() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }} />
      <Text style={styles.title}>Your Wellness Buddy</Text>
      <Text style={styles.subtitle}>
        We gently guide your health journey — like a caring buddy.
      </Text>
      <Image
        source={require('../assets/images/onboarding3.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={{ flex: 1 }} />
      <View style={styles.bottomRow}>
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => router.replace('/login')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', padding: 24, paddingTop: 0 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
  subtitle: { fontSize: 16, color: '#222', textAlign: 'center', marginVertical: 30 },
  image: { width: 300, height: 220, marginVertical: 16 },
  bottomRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dots: { flexDirection: 'row', alignItems: 'center' },
  dot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: '#E5E7EB', marginHorizontal: 4,
  },
  activeDot: { backgroundColor: '#4F46E5' },
  button: {
    width: '100%',
    backgroundColor: '#4F46E5',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
}); 