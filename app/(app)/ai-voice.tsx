import React, { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import VoiceBubble from '@/components/VoiceBubble';
import VoiceActions from '@/components/VoiceActions';
import { useAuthRedirect } from '@/hooks/useAuthCheck';
import { useRouter } from 'expo-router';
import { useBackExit } from '@/hooks/useBackClick';
import { useConversation } from '@11labs/react';
import { getSignedUrl } from '@/utils/api';
import { useLanguage } from '@/context/LanguageContext';

export default function AiVoice() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'mic-off' | 'speaking'>('idle');
  const router = useRouter();
  const { t } = useLanguage();
  useBackExit();
  useAuthRedirect();

  // ElevenLabs ConvAI conversation hook
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs ConvAI');
      setStatus('listening');
      setIsLoading(false);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs ConvAI');
      setStatus('idle');
      setIsLoading(false);
    },
    onMessage: (message) => {
      if (message.source === 'ai') {
        console.log('AI speaking:', message);
        setStatus('speaking');
      } else if (message.source === 'user') {
        console.log('User speaking:', message);
        setStatus('listening');
      }
    },
    onError: (error) => {
      console.error('ConvAI Error:', error);
      setStatus('idle');
      setIsLoading(false);
    },
  });

  const startConversation = async () => {
    try {
      setIsLoading(true);
      setStatus('connecting');
      
      // Get signed URL from ElevenLabs
      const signedUrl = await getSignedUrl('EIsgvJT3rwoPvRFG6c4n');
      
      // Start the conversation session and capture the conversationId
      const conversationId = await conversation.startSession({
        signedUrl,
        onConnect: () => {
          console.log('Session connected');
          setStatus('listening');
          setIsLoading(false);
        },
        onDisconnect: () => {
          console.log('Session disconnected');
          setStatus('idle');
          setIsLoading(false);
        },
        onError: (error) => {
          console.error('Session error:', error);
          setStatus('idle');
          setIsLoading(false);
        },
      });

      // Log the conversationId to test if you receive it
      console.log('📌 ElevenLabs conversation_id:', conversationId);

    } catch (error) {
      console.error('Failed to start conversation:', error);
      setStatus('idle');
      setIsLoading(false);
    }
  };

  const handleVoiceButtonPress = () => {
    if (status === 'idle') {
      startConversation();
    }
    // The conversation will handle disconnection automatically
    // when the user stops speaking or the session ends
  };

  return (
    <View style={styles.container}>
      <View style={styles.bubbleContainer}>
        <TouchableOpacity 
          onPress={handleVoiceButtonPress} 
          disabled={isLoading}
        >
          <VoiceBubble status={status} />
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
From https://github.com/Balajinaga007/Swarnaayuapp
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>
            {status === 'connecting' ? t('connecting_to_ai') : t('processing')}
          </Text>
        </View>
      )}

      <View style={styles.actionsContainer}>
        <VoiceActions
          status={status}
          onMicToggle={() => {
            if (status === 'mic-off') {
              setStatus('idle');
            } else {
              setStatus('mic-off');
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  bubbleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
});