
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import type { Recording } from 'expo-av/build/Audio';
import VoiceBubble from '@/components/VoiceBubble';
import VoiceActions from '@/components/VoiceActions';
import { useAuthRedirect } from '@/hooks/useAuthCheck';
import { useRouter } from 'expo-router';
import { useBackExit } from '@/hooks/useBackClick';

export default function AiVoice() {
  const [recording, setRecording] = useState<Recording | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'mic-off' | 'speaking'>('idle');
  const recordingRef = useRef<Recording | null>(null);
  const router = useRouter();
  const api_key = process.env.OpenAI_API_KEY;
  useBackExit();

  useAuthRedirect();
  const recordingOptions = {
    android: {
      extension: '.m4a',
      outputFormat: 2,
      audioEncoder: 3,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
    },
    ios: {
      extension: '.m4a',
      audioQuality: 2,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: 'audio/webm',
      bitsPerSecond: 128000,
    },
    isMeteringEnabled: true,
  };  

  const speak = (text: string) => {
    setStatus('speaking');
    Speech.speak(text, {
      language: 'en',
      rate: 1.0,
      onDone: () => {
        console.log('🗣️ AI finished speaking');
        setStatus('idle');
      },
      onStopped: () => {
        console.log('🛑 Speech was stopped');
        setStatus('idle');
      }
    });
  };

  const startRecording = async () => {
    try {
      setStatus('listening');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      recordingRef.current = recording;
      setRecording(recording);
      setTimeout(stopRecording, 3000); 
    } catch (err) {
      console.error('Failed to start recording', err);
      setStatus('idle');
    }
  };

  const stopRecording = async () => {
    try {
      setRecording(null);
      const recording = recordingRef.current;
      await recording?.stopAndUnloadAsync();
      const uri = recording?.getURI();
      transcribeAudio(uri);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const transcribeAudio = async (uri: any) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'audio.m4a',
        type: 'audio/m4a',
      } as any);
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      const transcription = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api_key}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await transcription.json();
      fetchAIResponse(result.text);
    } catch (error) {
      console.error('Transcription error:', error);
      setIsLoading(false);
    }
  };

  const fetchAIResponse = async (userText: any) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: userText }],
        }),
      });

      const data = await response.json();
      const aiReply = data?.choices?.[0]?.message?.content;

      if (!aiReply) {
        console.error('Invalid AI response:', data);
        return;
      }

      setResponseText(aiReply);
      setStatus('speaking');
      speak(aiReply);
      // Speech.speak(aiReply, {
      //   language: 'en',
      //   rate: 1.0,
      //   onDone: () => setStatus('idle'),
      // });
    } catch (err) {
      console.error('AI response error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
   
    <View style={styles.container}>
       
        <View style={{ marginBottom: 50}}>
      <TouchableOpacity onPress={startRecording} disabled={status !== 'idle'}>
        <VoiceBubble status={status} />
      </TouchableOpacity>
      </View>

      {isLoading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

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
     </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //padding: 20,
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
  link:{
    color: '#007BFF',
    marginTop: 20
  }
});
