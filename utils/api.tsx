// utils/api.ts
import Constants from 'expo-constants';

const { XI_AGENT_ID, XI_API_KEY } = Constants.expoConfig?.extra || {};
export async function getSignedUrl(): Promise<string> {
    const res = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${XI_AGENT_ID}&output_audio_format=mp3_44100_128`, {
      headers: {
        'xi-api-key': `${XI_API_KEY}`,
      },
    });
  
    const data = await res.json();
    if (!data.signed_url) {
      throw new Error('Failed to get signed URL');
    }
    return data.signed_url;
  }
  