import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Image, Text } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
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
import { useCallback } from 'react';

export default function App() {
  const router = useRouter();
  const [user_name, setName] = useState<string>("")
  const [phone_number, setPhone] = useState<string>("")
  const [status, setStatus] = useState<'idle'| 'connecting' | 'listening' | 'mic-off' | 'speaking'>('idle');
  useBackExit();
  const [permissionStatus, setPermissionStatus] = useState<'undetermined' | 'granted' | 'denied'>('undetermined');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [culturalPreference, setCulturalPreference] = useState<string>(""); // Will be set from API
  const [isSettingsLoaded, setIsSettingsLoaded] = useState<boolean>(false);

  useEffect(() => {
    fetchUserSettings();
    getUserDetails();
    
    checkMicPermission();
    getAuthToken();
  }, []);

  // Use focus effect to refresh cultural preference when returning to this screen
  useFocusEffect(
    useCallback(() => {
      const refreshCulturalPreference = async () => {
        const cachedPreference = await SecureStore.getItemAsync('cultural_preference');
        if (cachedPreference && cachedPreference !== culturalPreference) {
          console.log('🔄 Refreshing cultural preference from cache:', cachedPreference);
          setCulturalPreference(cachedPreference);
        }
      };
      
      refreshCulturalPreference();
    }, [culturalPreference])
  );

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

  const fetchUserSettings = async () => {
    console.log('🔄 Starting fetchUserSettings...');
    try {
      const token = await SecureStore.getItemAsync('token');
      console.log('🔑 Token retrieved:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        console.log('❌ No token available, marking settings as loaded');
        setIsSettingsLoaded(true);
        return;
      }

      // Check if settings were just updated to avoid unnecessary API calls
      const settingsJustUpdated = await SecureStore.getItemAsync('settings_just_updated');
      const updateTimestamp = await SecureStore.getItemAsync('settings_update_timestamp');
      
      if (settingsJustUpdated === 'true' && updateTimestamp) {
        const timeDiff = Date.now() - parseInt(updateTimestamp);
        // If settings were updated within the last 5 minutes, use cached values
        if (timeDiff < 5 * 60 * 1000) {
          console.log('⚡ Settings were recently updated, using cached values');
          const cachedPreference = await SecureStore.getItemAsync('cultural_preference');
          if (cachedPreference) {
            setCulturalPreference(cachedPreference);
            console.log('✅ Cultural preference set from cache:', cachedPreference);
          }
          setIsSettingsLoaded(true);
          // Clear the flag after using it to ensure fresh data on next app start
          await SecureStore.deleteItemAsync('settings_just_updated');
          await SecureStore.deleteItemAsync('settings_update_timestamp');
          return;
        } else {
          // Clear the flag if it's older than 5 minutes
          await SecureStore.deleteItemAsync('settings_just_updated');
          await SecureStore.deleteItemAsync('settings_update_timestamp');
        }
      }

      console.log('📡 Making API call to fetch user settings...');
      const response = await fetch('https://bot.swarnaayu.com/user/settings/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });

      console.log('📡 API Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ User settings response:', data);
        console.log('🌍 Cultural preference from API:', data.cultural_preference);
        const preference = data.cultural_preference;
        setCulturalPreference(preference);
        console.log('✅ Cultural preference set to:', preference);
        
        // Cache the preference for future use
        await SecureStore.setItemAsync('cultural_preference', preference);
      } else {
        console.log('❌ API call failed with status:', response.status);
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
      }
      
      console.log('✅ Marking settings as loaded');
      setIsSettingsLoaded(true);
    } catch (error) {
      console.error('❌ Error in fetchUserSettings:', error);
      console.log('✅ Marking settings as loaded despite error');
      setIsSettingsLoaded(true);
    }
  };





  const getAuthToken = async () => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      setAuthToken(token);
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
          auth_token={authToken}
          get_battery_level={tools.get_battery_level}
          change_brightness={tools.change_brightness}
          flash_screen={tools.flash_screen}
          status={status}
          setStatus={setStatus}
          cult={culturalPreference}
          isSettingsLoaded={isSettingsLoaded}
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
    height: 100, // Adjust this value based on your needs
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
    height: 600,
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
