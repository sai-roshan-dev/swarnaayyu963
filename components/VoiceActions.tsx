import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, useColorScheme, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';

type Props = {
  status: 'idle' | 'listening' | 'mic-off' | 'connecting' | 'speaking';
  permissionStatus?: string;
  microphonePermission?: boolean;
  onMicToggle: () => void;
};

export default function VoiceActions({ status, permissionStatus, microphonePermission, onMicToggle }: Props) {
  const [active, setActive] = useState<'comments' | 'mic' | 'settings' | null>(null);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scale = useRef(new Animated.Value(1)).current;

  const handleCommentsPress = () => {
    setActive('comments');
    router.push('/history');
  };

  const handleMicToggle = () => {
    setActive('mic');
    onMicToggle();
  };

  const handleSettingsPress = () => {
    setActive('settings');
    router.push('/settings');
  };

  const isMicOff = permissionStatus === 'undetermined' || permissionStatus === 'denied';
  const AnimatedRing = isMicOff ? Animatable.View : View;

  useEffect(() => {
    if (!isMicOff) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.5,
          duration: 500,
          easing: Easing.out(Easing.circle),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 500,
          easing: Easing.in(Easing.circle),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [isMicOff]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.iconRow}>
        <TouchableOpacity onPress={handleCommentsPress} style={styles.iconCircle}>
          <Ionicons
            name={active === 'comments' ? 'chatbubble-ellipses' : 'chatbubble-outline'}
            size={24}
            color="white"
          />
        </TouchableOpacity>

        <AnimatedRing
          animation={isMicOff ? 'pulse' : undefined}
          iterationCount="infinite"
          duration={1600}
          easing="ease-out"
          style={styles.ringContainer}
        >
          <TouchableOpacity onPress={handleMicToggle} style={styles.iconCircle}>
            <Animated.View style={{ transform: permissionStatus === 'granted' ? [] : [{ scale }] }}>
              <Ionicons
                name={permissionStatus === 'granted' ? 'mic-outline' : 'mic-off-outline'}
                size={26}
                color="white"
              />
            </Animated.View>
          </TouchableOpacity>
        </AnimatedRing>

        <TouchableOpacity onPress={handleSettingsPress} style={styles.iconCircle}>
          <Ionicons
            name={active === 'settings' ? 'settings' : 'settings-outline'}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginTop: 104,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 25,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 80,
    padding: 10,
    backgroundColor: 'transparent',
  },
});