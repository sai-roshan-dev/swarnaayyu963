import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import MicGradientIcon from './ui/MicIcon';

type Status = 'idle' | 'listening' | 'mic-off' | 'connecting' | 'speaking';

type Props = {
  status: Status;
  microphonePermisstion?: boolean;
};

export default function VoiceBubble({ status, microphonePermisstion }: Props) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

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
    switch (status) {
      case 'connecting':
        return 'Connecting...';
      case 'listening':
        return 'Listening..';
      case 'speaking':
        return 'speaking..';
      case 'idle':
        return 'Tap to Speak';
      case 'mic-off':
        return 'mic_off';
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
      {/* Three Outer Rings with subtle 3D perspective */}
      <OuterRing size={180} delay={0} animate={shouldAnimate} />
      <OuterRing size={220} delay={400} animate={shouldAnimate} />
      <OuterRing size={260} delay={800} animate={shouldAnimate} />

      {/* Rotating Dashed Outline with minimal 3D tilt */}
     
      {/* Light Black Circle Line with subtle 3D effect */}
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
  rotatingOutlineContainer: {
    position: 'absolute',
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  rotatingOutlineRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: '#1E90FF',
    borderStyle: 'dashed',
    shadowColor: '#1E90FF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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