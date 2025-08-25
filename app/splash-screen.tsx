import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const animationRef = useRef<LottieView>(null);
  const [animationFinished, setAnimationFinished] = useState(false);

  const navigateToNextScreen = async () => {
    const onboarding = await SecureStore.getItemAsync('onboardingComplete');
    console.log('isAuthenticated:', isAuthenticated, 'onboarding:', onboarding);
    if (isAuthenticated) {
      router.replace('/(app)');
    } else if (onboarding === 'true') {
      router.replace('/login');
    } else {
      router.replace('/font-size-onboarding');
    }
  };

  useEffect(() => {
    if (animationFinished) {
      const timer = setTimeout(() => {
        console.log('Navigating to next screen');
        navigateToNextScreen();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [animationFinished]);

  const handleAnimationFinish = () => {
    console.log('Animation finished');
    setAnimationFinished(true);
  };

  const handleSkip = () => {
    console.log('Skip pressed');
    navigateToNextScreen();
  };

  // Log Lottie file loading
  try {
    const animation = require('../assets/lottie/Aayu.json');
    console.log('Lottie file loaded:', animation);
  } catch (error) {
    console.error('Failed to load Lottie file:', error);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      

      <LottieView
        ref={animationRef}
        source={require('../assets/lottie/Aayu.json')}
        style={styles.lottieAnimation}
        autoPlay={true}
        loop={false}
        resizeMode="cover"
        onAnimationFinish={handleAnimationFinish}
        onError={(error) => console.error('Lottie Error:', error)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 10,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  lottieAnimation: {
    width: width,
    height: height,
    backgroundColor: '#fff', // Temporary for debugging
  },
});