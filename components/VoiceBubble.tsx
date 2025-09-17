import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import MicGradientIcon from './ui/MicIcon';
import * as SecureStore from 'expo-secure-store';

type Status = 'idle' | 'listening' | 'mic-off' | 'connecting' | 'speaking';
type Language = 'English' | 'Hindi';

type Props = {
  status: Status;
  microphonePermission?: boolean;
};

const languageMap: Record<string, Language> = {
  en: 'English',
  hi: 'Hindi',
};

const translations = {
  English: {
    connecting: 'Connecting...',
    listening: 'Listening..',
    speaking: 'speaking..',
    tap_to_speak: 'Tap to Speak',
    microphone_off: 'mic_off',
  },
  Hindi: {
    connecting: 'कनेक्ट हो रहा है...',
    listening: 'सुन रहा है..',
    speaking: 'बोल रहा है..',
    tap_to_speak: 'बोलने के लिए टैप करें',
    microphone_off: 'माइक्रोफोन बंद',
  },
};

export default function VoiceBubble({ status, microphonePermission }: Props) {
  console.log("-----VoiceBubble rendered-----------------")
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [language, setLanguage] = useState<Language>('English');

  // Fetch language from API
  const fetchLanguage = async () => {
    try {
      console.log('--- 🌐 [VOICEBUBBLE] Fetching language from API ---');
      
      const token = await SecureStore.getItemAsync('token');
      console.log("token value......",token);

      if (!token) {
        console.log('--- ❌ [VOICEBUBBLE] No token found ---');
        return;
      }
      
      const response = await fetch('https://bot.swarnaayu.com/user/settings/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });

      if (!response.ok) {
        console.log('--- ❌ [VOICEBUBBLE] API error:', response.status);
        return;
      }

      const data = await response.json();
      console.log('--- 📦 [VOICEBUBBLE] API response:', data);

      const languageValue = data.language && languageMap[data.language] 
        ? languageMap[data.language] 
        : 'English';
        
      console.log('--- ✅ [VOICEBUBBLE] Language set to:', languageValue);
      setLanguage(languageValue);
      
    } catch (error) {
      console.log('--- ❌ [VOICEBUBBLE] Fetch error:', error);
    }
  };

  useEffect(() => {
    console.log('--- 🚀 [VOICEBUBBLE] Component mounted, fetching language ---');
    fetchLanguage();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getText = () => {
    const lang = translations[language];
    switch (status) {
      case 'connecting':
        return lang.connecting;
      case 'listening':
        return lang.listening;
      case 'speaking':
        return lang.speaking;
      case 'idle':
        return lang.tap_to_speak;
      case 'mic-off':
        return lang.microphone_off;
      default:
        return '';
    }
  };

  const shouldAnimate = status === 'listening' || status === 'speaking';

  const OuterRing = ({ size, delay = 0, animate = false }: { size: number; delay?: number; animate?: boolean }) => (
    <Animatable.View
      animation={
        animate
          ? {
              0: {
                opacity: 0.7,
                transform: [{ scale: 1 }, { rotateX: '0deg' }],
              },
              1: {
                opacity: 0,
                transform: [{ scale: 2.5 }, { rotateX: '10deg' }],
              },
            }
          : undefined
      }
      iterationCount={animate ? 'infinite' : 1}
      duration={2000}
      delay={delay}
      easing="ease-out"
      style={[styles.pulseRing, { width: size, height: size, borderRadius: size / 2 }]}
    />
  );

  return (
    <View style={styles.container}>
      <OuterRing size={180} delay={0} animate={shouldAnimate} />
      <OuterRing size={220} delay={400} animate={shouldAnimate} />
      <OuterRing size={260} delay={800} animate={shouldAnimate} />

      <View style={styles.outerCircle}>
        <LinearGradient
          colors={['#4F46E5', '#4F46E5']}
          style={styles.glow}
          start={[0.5, 0]}
          end={[0.5, 1]}
        >
          <View style={styles.circle}>
            {shouldAnimate ? (
              <Animatable.View
                animation={{
                  0: { transform: [{ scale: 1 }] },
                  0.25: { transform: [{ scale: 1.15 }] },
                  0.5: { transform: [{ scale: 1.3 }] },
                  0.75: { transform: [{ scale: 1.15 }] },
                  1: { transform: [{ scale: 1 }] },
                }}
                duration={1400}
                easing="ease-in-out"
                iterationCount="infinite"
                style={styles.micIconWrapper}
              >
                <MicGradientIcon size={64} />
              </Animatable.View>
            ) : (
              <Text style={styles.text}>{getText()}</Text>
            )}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingTop: 20,
    marginTop: 60,
  },
  pulseRing: {
    position: 'absolute',
    backgroundColor: '#d2ebff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  glow: {
    padding: 16,
    borderRadius: 999,
    shadowColor: '#b2e0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
    zIndex: 1,
  },
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  micIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: -1, height: -1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
});