// screens/ConversationScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet , ViewStyle} from 'react-native';
import { Audio } from 'expo-av';
import { getSignedUrl } from '../utils/api';
import { connectToAgent } from '../utils/ws'; // You'll write this manually
import { useConversation } from '@11labs/react';
import * as SecureStore from 'expo-secure-store';


export default function ConversationScreen() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const conversatio = useConversation();

  console.log(conversatio, 'conversation')

  useEffect(() => {
    (async () => {
      await Audio.requestPermissionsAsync();
  
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeIOS: 1 ,//Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        interruptionModeAndroid: 1  // Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      });
    })();
  }, []);
  

  const startConversatio = async () => {
    try {
      // Get signed URL from your backend or directly from ElevenLabs
      const signedUrl = await getSignedUrl();
    //   const ws = connectToAgent(signedUrl, async (audioBlob: any) => {
    //     const sound = new Audio.Sound();
    //     const uri = URL.createObjectURL(audioBlob); // If blob is playable
    //     console.log(uri, 'audio uri')
    //     await sound.loadAsync({ uri });
    //     await sound.playAsync();
    //     soundRef.current = sound;
    //     setIsSpeaking(true);

    //     sound.setOnPlaybackStatusUpdate((status) => {
    //         if ('isPlaying' in status && !status.isPlaying) {
    //           setIsSpeaking(false);
    //         }
    //     });
    //   });

    const conversation = await conversatio.startSession({
      
      // const token = await SecureStore.getItemAsync('token');
      // if (!token) {
      //   alert('No authentication token found. Please log in again.');
      //   return;
      // }
      // const conversation = await conversatio.startSession({
        signedUrl,
        dynamicVariables: {
            auth_token: 'Token b068249ed4b844bf9f64d93615529edf88bcbdba'
          //auth_token: `Token ${token}`  
        },
        onConnect: () => {
            // setIsConnected(true)
            // setIsSpeaking(true)
            console.log('connected session')
        },
        onDisconnect: () => {
            console.log('disconnected session')
            // setIsConnected(false)
            // setIsSpeaking(false)
        },
        onError: (error) => {
            console.log(error)
            alert('An error occurred during the conversation')
        },
        // onModeChange: ({mode}) => {
        //     setIsSpeaking(mode === 'speaking')
        // },
    })
      const ws = connectToAgent(signedUrl, async (fileUri: string) => {
        console.log(fileUri, 'passed file uri')
        const sound = new Audio.Sound();
        await sound.loadAsync({ uri: fileUri });
        await sound.playAsync();
        soundRef.current = sound;
        setIsSpeaking(true);
      
        sound.setOnPlaybackStatusUpdate((status) => {
          if ('isPlaying' in status && !status.isPlaying) {
            setIsSpeaking(false);
          }
        });
      });
      

      socketRef.current = ws;
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };


  const startConversation = async () => {
    try {
      const signedUrl = await getSignedUrl();
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        alert('No authentication token found. Please log in again.');
        return;
      }
      const conversation = await conversatio.startSession({
        signedUrl,
        dynamicVariables: {
          auth_token: `Token ${token}`
        },
        onConnect: () => console.log('connected session'),
        onDisconnect: () => console.log('disconnected session'),
        onError: (error) => {
          console.log(error);
          alert('An error occurred during the conversation');
        },
      });
  
      const ws = connectToAgent(signedUrl, async (fileUri: string) => {
        const sound = new Audio.Sound();
        await sound.loadAsync({ uri: fileUri });
        await sound.playAsync();
        soundRef.current = sound;
        setIsSpeaking(true);
  
        sound.setOnPlaybackStatusUpdate((status) => {
          if ('isPlaying' in status && !status.isPlaying) {
            setIsSpeaking(false);
          }
        });
      });
  
      socketRef.current = ws;
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const endConversation = () => {
    if (socketRef.current) {
      socketRef.current.close();
      setIsConnected(false);
      setIsSpeaking(false);
    }
  };



  return (
    <View style={styles.container}>
      <Text style={styles.status}>
        {isConnected
          ? isSpeaking
            ? 'Agent is speaking'
            : 'Agent is listening'
          : 'Disconnected'}
      </Text>

      <View style={getOrbStyle(isConnected, isSpeaking)} />

      <TouchableOpacity
        style={[styles.button, isConnected && styles.disabled]}
        onPress={startConversation}
        disabled={isConnected}
      >
        <Text style={styles.buttonText}>Start Conversation</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !isConnected && styles.disabled]}
        onPress={endConversation}
        disabled={!isConnected}
      >
        <Text style={styles.buttonText}>End Conversation</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  status: { fontSize: 18, marginBottom: 20 },

  button: {
    padding: 15,
    backgroundColor: '#333',
    borderRadius: 25,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: '#999',
  },
  buttonText: { color: '#fff', fontSize: 16 },
});


const getOrbStyle = (connected: boolean, speaking: boolean): ViewStyle => ({
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: connected ? (speaking ? '#00f' : '#0f0') : '#ccc',
    marginBottom: 40,
  });
  