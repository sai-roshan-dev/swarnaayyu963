import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AiVoice from './ai-voice';
import "../../global.css";
import ConvAiDOMComponent from '@/components/ConvAi';
import tools from '@/utils/tools';
import { useBackExit } from '@/hooks/useBackClick';
import { Audio } from 'expo-av';
import { useAuthRedirect } from '@/hooks/useAuthCheck';
import * as SecureStore from 'expo-secure-store';
import GradientBackground from '@/components/GradientBackground';

export default function App() {
  const router = useRouter();
  const [user_name, setName] = useState<string>("")
  const [phone_number, setPhone] = useState<string>("")
  const [status, setStatus] = useState<'idle'| 'connecting' | 'listening' | 'mic-off' | 'speaking'>('idle');
  useBackExit();
  const [permissionStatus, setPermissionStatus] = useState<'undetermined' | 'granted' | 'denied'>('undetermined');

  useEffect(() => {
    getUserDetails()
    checkMicPermission();
  }, []);

  const getUserDetails = async() =>{
    const user_name = await SecureStore.getItemAsync('name');
    const phone_number = await SecureStore.getItemAsync('phone_number');
    if(user_name){
      setName(user_name)
    }
    if(phone_number){
      setPhone(phone_number)
    }
  }

  const checkMicPermission = async () => {
    const { status } = await Audio.getPermissionsAsync();
    setPermissionStatus(status);
  };

  return (
    <View style={styles.container}>
      <GradientBackground />
      {/* Status in top right corner */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {status === 'speaking' && 'Speaking'}
          {status === 'listening' && 'Listening'}
        </Text>
      </View>
      {/* Clock Icon */}
     

      <View style={styles.domComponentContainer}>       
        <ConvAiDOMComponent
          dom={{ style: styles.domComponent }}
          permissionStatus={permissionStatus}
          checkMicPermission={checkMicPermission}
          platform={Platform.OS}
          user_name={user_name}
          phone_number={phone_number}
          get_battery_level={tools.get_battery_level}
          change_brightness={tools.change_brightness}
          flash_screen={tools.flash_screen}
          status={status}
          setStatus={setStatus}
        />
      </View>

      {/* Bottom Background Image */}
      <Image
        source={require('../../assets/images/back_lower.png')}
        style={styles.bottomBackground}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockIcon: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 25,
  },
  bottomBackground: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 200, // Adjust this value based on your needs
    zIndex: -1, // Place it behind other content
  },
  responseBox: {
    marginTop: 30,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  responseText: {
    fontSize: 16,
    textAlign: 'center',
  },
  domComponentContainer: {
    width: 800,
    height: 500,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  domComponent: {
    width: 600,
    height: 500,
  },
  statusContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 2,
    
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  statusText: {
    fontWeight: 'bold',
    color: '#007BFF',
    fontSize: 16,
  },
});
