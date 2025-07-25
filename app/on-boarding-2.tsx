// app/on-boarding-2.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function OnBoarding2() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }} />
      <Text style={styles.title}>Your AI Assistant</Text>
      <Text style={styles.subtitle}>
        I’m always here for a chat - anytime, anywhere.
      </Text>
      <Image
        source={require('../assets/images/onboarding2.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={{ flex: 1 }} />
      <View style={styles.bottomRow}>
        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
        </View>
        <TouchableOpacity onPress={() => router.replace('/on-boarding-3')}>
          <Text style={styles.next}>Next</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  skip: { color: '#4F46E5', fontSize: 18, marginLeft: 8 },
  next: { color: '#000', fontSize: 18, marginRight: 8 },
  dots: { flexDirection: 'row', alignItems: 'center' },
  dot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: '#E5E7EB', marginHorizontal: 4,
  },
  activeDot: { backgroundColor: '#4F46E5' },
});
