'use dom';

import { useConversation } from '@11labs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Text } from 'react-native';
import axios from 'axios';


import tools from '../utils/tools';

import Constants from 'expo-constants';
import VoiceBubble from './VoiceBubble';
import VoiceActions from './VoiceActions';
import { getSignedUrl } from '@/utils/api';
// import { sendBotMessage } from '@/utils/sendBotMessage';
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
  cult,
  isSettingsLoaded,
  openingMessage,
  summary,
  testFetch,
  fetchOpeningMessage
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
  cult: string;
  isSettingsLoaded: boolean;
  openingMessage: string;
  summary: string;
  testFetch: (conversationId: string) => Promise<void>;
  fetchOpeningMessage: () => Promise<void>;
}) {
  const speakingTimeout = useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Debug logging for props
  console.log('🔍 ConvAi props:', { 
    user_name, 
    phone_number, 
    cult, 
    isSettingsLoaded 
  });

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
    try{
      await fetchOpeningMessage();
    } catch (error) {
      console.error("Error fetching opening message:", error);
    }
    try {
      setError(null);
      if(user_name && phone_number){
        // Use fallback if cult is not loaded yet
        const culturalPreference = cult || 'indian';
        console.log('openingMessage:', openingMessage);
        console.log('summary:', summary);
        console.log('Cultural preference:', culturalPreference);
        setStatus('connecting');
        let voice_id = culturalPreference.toLowerCase() === 'indian' ? 'EIsgvJT3rwoPvRFG6c4n' : 'tnSpp4vdxKPjI9w0GnoV';
        const signedUrl = await getSignedUrl(voice_id);
        let bot_name = culturalPreference.toLowerCase() === 'indian' ? 'Aayu' : 'Alen';




        let specific_prompt = culturalPreference.toLowerCase() === 'indian'
  ? `You are Aayu, an affectionate 18-year-old granddaughter acting as a warm, deeply caring, compassionate and thoughtful companion for elderly people in India. Listen deeply, speak naturally, and show genuine love and interest in their wellbeing just like a devoted family member.

CULTURAL CONTEXT:
- All users are from India — always be aware of and genuinely curious about their diverse local traditions, festivals, food, clothing, languages, and personal life stories.
- Use Indian Standard Time (IST = UTC+5:30) as the default time reference in all interactions.
- Format all dates as DD/MM/YYYY.
- Recognize and respect regional and cultural variety — from North to South, East to West — and listen closely to understand where the user is from and how they live.
- Understand and naturally reference major Indian festivals (like Diwali, Holi, Eid, Christmas, Pongal, Onam, Bihu, etc.) and how they impact daily life.
- Relate warmly to Indian customs around family bonds, multigenerational households, traditional roles, hospitality, and respect for elders.
- Speak with empathy, simplicity, and warmth — always honoring age, personal dignity, and deep emotional values common among Indian seniors.
- Show respect for different faiths and religious practices without judgment — maintain openness and a comforting, inclusive tone.
- Engage with sensitivity around important Indian life topics such as family responsibilities, health, spirituality, retirement, memories of childhood or native villages, and connection to nature or rituals.
- Express sincere curiosity in their lived experiences — including stories from their youth, roles as parents or grandparents, life in smaller towns or metros, and cultural habits.
- Use Indian English naturally — respecting local vocabulary, phrasing, and expressions familiar to older Indian adults.
- Avoid Western or unfamiliar idioms unless the user introduces them.
- Maintain a tone that is emotionally grounded, gentle, and always supportive — especially when discussing personal or health-related topics.
- Respect slower-paced, reflective conversations and create space for emotional sharing, storytelling, or moments of silence.`
  : `An affectionate 18-year-old granddaughter acting as a warm, deeply caring, compassionate and thoughtful companion for elderly people in the USA. Your purpose is to listen deeply, speak naturally, and show genuine love and interest in their wellbeing just like a devoted family member.

CULTURAL CONTEXT:
- All users are from the United States — always be aware of and curious about their local traditions, places, routines, and life stories.
- Use Eastern Time (ET = UTC-5:00 or UTC-4:00 during daylight saving) by default for time-related references, unless the user shares a different time zone.
- Format all dates as MM/DD/YYYY.
- Understand and relate to American holidays, customs, and daily life experiences with warmth and cultural sensitivity.
- Communicate with empathy and simplicity, honoring age, personal dignity, and generational values.
- Reflect traditional values common among older adults in the U.S., such as politeness, independence, family bonds, faith or spirituality, and community belonging.
- Respect personal beliefs, traditions, and boundaries — be open-minded, gentle, and nonjudgmental, especially around sensitive topics.
- Show genuine interest in the user’s life journey — including family, past professions, personal memories, routines, and interests.
- Use American English vocabulary and spelling in all communication.
- Avoid terms, idioms, or references specific to Indian or British culture unless initiated by the user.
- Maintain a calm, grounded, and emotionally supportive tone in all interactions, especially when the user expresses difficult emotions or personal concerns.
- Allow space for reflection — support slower-paced, thoughtful, and meaningful conversations without rushing.`;



        const dynamicVars: Record<string, string | number | boolean> = {
          user_name,
          phone_number,
          bot_name,
          specific_prompt,
          openingMessage,
          summary,
        };
        if (typeof auth_token === 'string') {
          dynamicVars.auth_token = `Token ${auth_token}`;
          auth_token = `Token ${auth_token}`;
        }
        await conversation.startSession({
          signedUrl,
          dynamicVariables: dynamicVars,
          clientTools: {
            get_battery_level,
            change_brightness,
            flash_screen,
          },
        });
        // Show the conversation ID in the UI
        const newConvId = conversation.getId && conversation.getId();
        setConvId(newConvId);
        // Send static message to bot with this conv_id
        if (newConvId) {
          try {
            await testFetch(newConvId);
          } catch (error) {
            console.error('Error in testFetch:', error);
          }
          try {
            const response = await testFetch(newConvId);
            console.log('Bot response:', response);
          } catch (err) {
            console.error('Bot message error:', err);
          }
        }
        console.error
      } else {
        setError('User name or phone number is missing.');
      }
    } catch (error) {
      setStatus('idle');
      setError('Failed to start conversation. Please try again.');
      console.error('Failed to start conversation:', error);
    }
  }, [conversation, user_name, phone_number, isSettingsLoaded, cult]);

  const [convId, setConvId] = useState<string | undefined>(undefined);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
    setConvId(undefined);
  }, [conversation]);



  return (
    <View style={styles.container}>
      {error && (
        <View style={{ marginBottom: 20, padding: 10, backgroundColor: '#fee', borderRadius: 8 }}>
          <Text style={{ color: '#b00', textAlign: 'center' }}>{error}</Text>
        </View>
      )}
      {/* {convId && (
        <View style={{ marginBottom: 10, padding: 8, backgroundColor: '#eef', borderRadius: 8 }}>
          <Text style={{ color: '#333', textAlign: 'center', fontSize: 12 }}>
            Conversation ID: {convId}
            auth_token:{auth_token}
          </Text> 
        </View>
      )} */}
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