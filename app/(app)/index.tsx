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
  const [accent, setAccent] = useState<string>('default'); // Will be set from API
  const [isSettingsLoaded, setIsSettingsLoaded] = useState<boolean>(false);
  const [openingMessage] = useState<string>('');
  const [summary] = useState<string>('');
  useEffect(() => {
    fetchUserSettings();
    getUserDetails();
    fetchOpeningMessage();
    checkMicPermission();
    getAuthToken();
  }, []);
  // Use focus effect to refresh cultural preference when returning to this screen
  useFocusEffect(
    useCallback(() => {
      const refreshCulturalPreference = async () => {
        const cachedPreference = await SecureStore.getItemAsync('cultural_preference');
        if (cachedPreference && cachedPreference !== culturalPreference) {
          console.log(':arrows_anticlockwise: Refreshing cultural preference from cache:', cachedPreference);
          setCulturalPreference(cachedPreference);
        }
      };
      const refreshAccent = async () => {
        const cachedAccent = await SecureStore.getItemAsync('accent');
        if (cachedAccent) {
          console.log(':arrows_anticlockwise: Refreshing accent from cache:', cachedAccent);
          setAccent(cachedAccent)
        }
      };
      refreshCulturalPreference();
      refreshAccent();
    }, [culturalPreference, accent])
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
    console.log(':arrows_anticlockwise: Starting fetchUserSettings...');
    try {
      const token = await SecureStore.getItemAsync('token');
      console.log(':key: Token retrieved:', token ? 'Token exists' : 'No token found');
      if (!token) {
        console.log(':x: No token available, marking settings as loaded');
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
          console.log(':zap: Settings were recently updated, using cached values');
          const cachedPreference = await SecureStore.getItemAsync('cultural_preference');
          if (cachedPreference) {
            setCulturalPreference(cachedPreference);
            console.log(':white_tick: Cultural preference set from cache:', cachedPreference);
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
      console.log(':satellite_antenna: Making API call to fetch user settings...');
      const response = await fetch('https://bot.swarnaayu.com/user/settings/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });
      console.log(':satellite_antenna: API Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log(':white_tick: User settings response:', data);
        console.log(':earth_africa: Cultural preference from API:', data.cultural_preference);
        const preference = data.cultural_preference;
        setCulturalPreference(preference);
        console.log(':white_tick: Cultural preference set to:', preference);
        // Cache the preference for future use
        await SecureStore.setItemAsync('cultural_preference', preference);
      } else {
        console.log(':x: API call failed with status:', response.status);
        const errorText = await response.text();
        console.log(':x: Error response:', errorText);
      }
      console.log(':white_tick: Marking settings as loaded');
      setIsSettingsLoaded(true);
    } catch (error) {
      console.error(':x: Error in fetchUserSettings:', error);
      console.log(':white_tick: Marking settings as loaded despite error');
      setIsSettingsLoaded(true);
    }
  };
  const fetchOpeningMessage = async () => {
  console.log(":large_green_circle: Starting fetchOpeningMessage...");
  try {
    console.log(":key: Fetching token from SecureStore...");
    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      console.log(":x: No token available for opening message");
      return { openingMessage: "", summary: "" }
    }
    console.log(":white_tick: Token retrieved:", token);
    const url = "https://bot.swarnaayu.com/conversation/opening-message/";
    console.log(":globe_with_meridians: Sending GET request to:", url);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });
    console.log(":inbox_tray: Response status:", response.status);
    if (response.ok) {
      console.log(":white_tick: Response is OK, parsing JSON...");
      const data = await response.json();
      console.log(":package: Data received:", data);
      // if (data.opening_message) {
      //   console.log(":white_tick: Opening message found:", data.opening_message);
      //   setOpeningMessage(data.opening_message);
      //   console.log(openingMessage);
      const openingMessage = data.opening_message || "";
      const summary = data.summary || "";
        // if (data.summary) {
        //   console.log(":white_tick: Summary found:", data.summary);
        //   setSummary(data.summary);
       console.log("Opening Message:", openingMessage);
       console.log("Summary:", summary);
          return { openingMessage, summary };
        } else {
      //     console.log(":warning: No summary found in response");
      //   }
      // } else {
      //   console.log(":warning: No opening_message found in response");
      // }
    // } else {
      console.log(":x: API call failed with status:", response.status);
      const errorText = await response.text();
      console.log(":x: Error response body:", errorText);
      return { openingMessage: "", summary: ""};
    }
  } catch (error) {
    console.error(":boom: Error in fetchOpeningMessage:", error);
    return { openingMessage: "", summary: ""};
  } finally {
    console.log(":red_circle: fetchOpeningMessage finished");
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
const testFetch = async (conversationId: string) => {
      try {
        const token = await SecureStore.getItemAsync('token');
        const res = await fetch("https://bot.swarnaayu.com/conversation/chat/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`,
          },
          body: JSON.stringify({
            message: "hi",
            mode: "voice",
            conversation_id: conversationId,
          }),
        });
        console.log(":white_tick: Status:", res.status);
        const text = await res.text();
        console.log(":white_tick: Response:", text);
      } catch (err) {
        console.error(":x: Fetch failed:", err);
      }
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
          openingMessage={openingMessage}
          summary={summary}
          testFetch={testFetch}
          fetchOpeningMessage={fetchOpeningMessage}
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
