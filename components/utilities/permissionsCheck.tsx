import { Audio } from "expo-av";
import { Platform } from "react-native";

 export async function mobileMicrophonePermission(platform: any) {
    const { status , canAskAgain} = await Audio.requestPermissionsAsync();
      if(status !== 'granted'){
        if (!canAskAgain && status === 'denied') {
          alert('Please enable microphone permission from Settings');
          return false;
        }else{
          alert('please allow permission');
          return false;
        }
        
      }else{
        return true;
      }
  }