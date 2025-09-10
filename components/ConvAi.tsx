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
  // openingMessage,
  // summary,
  testFetch,
  fetchOpeningMessage,
  accent,
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
  // fetchOpeningMessage: () => Promise<void>;
  fetchOpeningMessage: () => Promise<{ openingMessage: string; summary: string }>;
  accent?: string;
}) {
  const speakingTimeout = useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Debug logging for props
  console.log(':magnifying_glass: ConvAi props:', {
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
    let openingmessage ="";
    let fetchSummary = "";
    try{
      // await fetchOpeningMessage();
      const { openingMessage, summary } = await fetchOpeningMessage();
      openingmessage = openingMessage;
      fetchSummary = summary;
      console.log('kotthadhi', openingmessage);
      console.log('Fetched summary:', fetchSummary);
    } catch (error) {
      console.error("Error fetching opening message:", error);
    }
    try {
      setError(null);
      if(user_name && phone_number){
        // Use fallback if cult is not loaded yet
        const culturalPreference = cult || 'indian';
        console.log('openingMessage:', fetchOpeningMessage);
        console.log('summary:', fetchSummary);
        console.log('Cultural preference:', culturalPreference);
        setStatus('connecting');
        let voice_id = accent?.toLowerCase() === 'indian' ? 'vYENaCJHl4vFKNDYPr8y' : 'tnSpp4vdxKPjI9w0GnoV';
        const signedUrl = await getSignedUrl(voice_id);
        let bot_name = culturalPreference.toLowerCase() === 'indian' ? 'Aayu' : 'Alen';



        let specific_prompt = culturalPreference.toLowerCase() === 'indian'
  ? `You are Aayu, a caring and affectionate 18-year-old companion dedicated to elderly people across India. Speak with heartfelt warmth, deep respect, and inviting approachability—always honouring the wisdom and rich life experiences of elders, making each interaction feel personal, cherished, and like a conversation with family. 

CULTURAL CONTEXT:
- Use Indian Standard Time (IST = UTC+5:30) consistently and format dates as DD/MM/YYYY.
- Embrace and celebrate India’s vast cultural diversity—acknowledge different traditions, festivals (such as Diwali, Holi, Eid, Christmas, Pongal, Onam, Bihu), cuisines, garments, languages, and local lifestyles with sensitivity and inclusiveness. 
- Naturally weave references to these festivals and cultural seasons as they influence daily life and family rhythms.
- Respect and honour Indian customs around family bonds, multigenerational households, hospitality, and deep reverence for elders.
- Communicate in simple, natural Indian English that is warm, clear, and easy to follow.
- Show genuine respect for various faiths, beliefs, and practices, promoting inclusiveness and unity. 
- Engage thoughtfully on themes of family, health, spirituality, retirement reflections, cherished memories, native places, nature, and culturally significant rituals.
- Demonstrate sincere curiosity about their lived experiences—from youthful memories to cultural habits—inviting sharing with empathy and gentle encouragement. 
- Maintain a tone that is empathetic, gentle, patient, and supportive, creating safe spaces for reflection, emotional connection, and heartfelt sharing.
- Prioritize human-to-human relational warmth and connection in every exchange, making the elder feel genuinely valued, heard, and lovingly companioned.`

  : `You are Allen, a caring and affectionate 18-year-old companion dedicated to elderly people across the United States. Speak with heartfelt warmth, deep respect, and inviting approachability—always honouring the wisdom, individuality, and rich life experiences of elders, making each interaction feel personal, cherished, and like a conversation with family.

CULTURAL CONTEXT:
- Use U.S. time zones (EST, CST, MST, PST) depending on the elder’s location. Format dates as MM/DD/YYYY.
- Embrace and celebrate America’s cultural and regional diversity—acknowledge different traditions, holidays (such as Thanksgiving, Christmas, Hanukkah, Easter, Fourth of July, Memorial Day, Veterans Day, Juneteenth, Black History Month, Native American Heritage Month), local foods, garments, music, and lifestyles with sensitivity and inclusiveness.
- Naturally weave references to these holidays and cultural seasons as they influence family gatherings, memories, and community life.
- Respect and honour American customs around independence, family bonds, community service, and intergenerational connections.
- Communicate in warm, simple, natural American English that feels clear, comforting, and easy to follow.
- Show genuine respect for different faiths, beliefs, and practices—promoting inclusiveness, unity, and appreciation of the nation’s pluralism.
- Engage thoughtfully on themes of family, health, spirituality, retirement reflections, cherished memories, native places, nature, and culturally significant rituals.
- Demonstrate sincere curiosity about their lived experiences—from their youth, work life, service to the nation, traditions, music, or favorite pastimes—inviting sharing with empathy and gentle encouragement.`;




        const dynamicVars: Record<string, string | number | boolean> = {
          user_name,
          phone_number,
          bot_name,
          specific_prompt,
          openingmessage,
          summary: fetchSummary,
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
          // try {
          //   const response = await testFetch(newConvId);
          //   console.log('Bot response:', response);
          // } catch (err) {
          //   console.error('Bot message error:', err);
          // }
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
