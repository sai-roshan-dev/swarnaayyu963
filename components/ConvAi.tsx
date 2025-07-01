'use dom';

import { useConversation } from '@11labs/react';
import { useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';


import tools from '../utils/tools';

import Constants from 'expo-constants';
import VoiceBubble from './VoiceBubble';
import VoiceActions from './VoiceActions';
import { getSignedUrl } from '@/utils/api';

const { XI_AGENT_ID, XI_API_KEY } = Constants.expoConfig?.extra || {};


export default function ConvAiDOMComponent({  
  platform,
  user_name,
  phone_number,
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
  permissionStatus: string;
  checkMicPermission: () => void;
  get_battery_level: typeof tools.get_battery_level;
  change_brightness: typeof tools.change_brightness;
  flash_screen: typeof tools.flash_screen;
  status: 'idle'| 'connecting' | 'listening' | 'mic-off' | 'speaking';
  setStatus: (s: 'idle'| 'connecting' | 'listening' | 'mic-off' | 'speaking') => void;
}) {
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected')
      setStatus('listening');
      checkMicPermission()
    },
    onDisconnect: () => {
      setStatus('idle');
      console.log('Disconnected')
    },
    onMessage: (message) => {
      if(message.source === 'ai'){
        console.log(message, 'test ai message');
        setStatus('speaking');
      }else if(message.source === 'user'){
        console.log(message, 'test user message');
        setStatus('listening');
      }
    },
   
    
    onError: (error) => {
      setStatus('idle');
      console.error('Error:', error)
    },
  });
  const startConversation = useCallback(async () => {
    try {
      //Madhava

      // Start the conversation with your agent
      if(user_name && phone_number){
        setStatus('connecting');
        const signedUrl = await getSignedUrl();
        await conversation.startSession({
          signedUrl,
          //agentId: `${XI_AGENT_ID}`, // Replace with your agent ID
          dynamicVariables: {
            user_name,
            phone_number
          },
          clientTools: {
            get_battery_level,
            change_brightness,
            flash_screen,
          },
        });
      }
    } catch (error) {
      setStatus('idle');
      console.error('Failed to start conversation:', error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <View style={styles.container}>
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
