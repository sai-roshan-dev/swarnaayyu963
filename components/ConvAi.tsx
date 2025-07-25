'use dom';

import { useConversation } from '@11labs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Text } from 'react-native';


import tools from '../utils/tools';

import Constants from 'expo-constants';
import VoiceBubble from './VoiceBubble';
import VoiceActions from './VoiceActions';
import { getSignedUrl } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const { XI_AGENT_ID, XI_API_KEY } = Constants.expoConfig?.extra || {};


export default function ConvAiDOMComponent({  
  platform,
  user_name,
  phone_number,
  auth_token,
  permissionStatus,
  checkMicPermission,
  get_battery_level,
  change_brightness,
  flash_screen,
  status,
  setStatus,
}: {
  dom?: import('expo/dom').DOMProps;
  platform: string;
  user_name: string;
  phone_number: string;
  auth_token?: string | null;
  permissionStatus: string;
  checkMicPermission: () => void;
  get_battery_level: typeof tools.get_battery_level;
  change_brightness: typeof tools.change_brightness;
  flash_screen: typeof tools.flash_screen;
  status: 'idle'| 'connecting' | 'listening' | 'mic-off' | 'speaking';
  setStatus: (s: 'idle'| 'connecting' | 'listening' | 'mic-off' | 'speaking') => void;
}) {
  const speakingTimeout = useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      const token = await SecureStore.getItemAsync('token');
      setAuthToken(token);
    };
    getToken();
  }, []);

  const handleMessage = (message: any) => {
    if (message.source === 'ai') {
      setStatus('speaking');
      if (speakingTimeout.current) clearTimeout(speakingTimeout.current);
      speakingTimeout.current = setTimeout(() => {
        setStatus('listening');
      }, 3000); // 3 seconds, adjust as needed
    } else if (message.source === 'user') {
      setStatus('listening');
      if (speakingTimeout.current) clearTimeout(speakingTimeout.current);
    }
  };

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected')
      setStatus('listening');
      checkMicPermission()
    },
    onDisconnect: () => {
      setStatus('idle');
      if (speakingTimeout.current) clearTimeout(speakingTimeout.current);
      console.log('Disconnected - session ended, status set to idle');
    },
    onMessage: handleMessage,
    onError: (error) => {
      setStatus('idle');
      console.error('Error:', error)
    },
  });
  const startConversation = useCallback(async () => {
    try {
      setError(null);
      if (user_name && phone_number) {
        setStatus('connecting');
        const signedUrl = await getSignedUrl('EIsgvJT3rwoPvRFG6c4n');
        const dynamicVars: Record<string, string | number | boolean> = {
          user_name,
          phone_number,
        };
        if (typeof auth_token === 'string') {
          dynamicVars.auth_token = `Token ${auth_token}`;
        }
        // Start the session
        await conversation.startSession({
          signedUrl,
          dynamicVariables: dynamicVars,
          clientTools: {
            get_battery_level,
            change_brightness,
            flash_screen,
          },
        });
        // Get the conversationId
        const conversationId = conversation.getId();
        if (conversationId) {
          // Try to import API_ENDPOINTS, fallback to hardcoded URL if not available
          let chatEndpoint = 'https://bot.swarnaayu.com/conversation/chat/';
          try {
            // Dynamically import if possible
            // @ts-ignore
            const { API_ENDPOINTS } = await import('@/config/api');
            if (API_ENDPOINTS && API_ENDPOINTS.CHAT) {
              chatEndpoint = API_ENDPOINTS.CHAT;
            }
          } catch (e) {
            // fallback to hardcoded URL
          }
          // Send conversationId to backend
          const response = await fetch(chatEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(auth_token ? { 'Authorization': `Token ${auth_token}` } : {}),
              'mode': 'voice',
            },
            body: JSON.stringify({
              message: 'hii there ?',
              conversation_id: conversationId,
            }),
          });
          if (!response.ok) {
            throw new Error('Failed to send conversation data to backend');
          }
        } else {
          console.error('Conversation ID is undefined');
          setError('Failed to retrieve conversation ID.');
        }
      } else {
        setError('User name or phone number is missing.');
      }
    } catch (error) {
      setStatus('idle');
      setError('Failed to start conversation. Please try again.');
      console.error('Failed to start conversation:', error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);


  return (
    <View style={styles.container}>
      {error && (
        <View style={{ marginBottom: 20, padding: 10, backgroundColor: '#fee', borderRadius: 8 }}>
          <Text style={{ color: '#b00', textAlign: 'center' }}>{error}</Text>
        </View>
      )}
      <View style={{ marginBottom: 50}}>
        <TouchableOpacity  onPress={conversation.status === 'disconnected' ? startConversation  : stopConversation} >
          <VoiceBubble status={status} />
        </TouchableOpacity>
      </View>
    
      <VoiceActions
        status={status}
        permissionStatus={permissionStatus}
        onMicToggle={async () => {
          if (status === 'mic-off') {
          }
        }}
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
  callButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  callButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  buttonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 5,
  },
  buttonInnerActive: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  buttonIcon: {
    transform: [{ translateY: 2 }],
  },
});
