import { Audio } from 'expo-av';
import { PermissionsAndroid, Platform } from 'react-native';

 export async function mobileMicrophonePermission(platform: any) {
      console.log('utility platform log', Platform.OS);
    
    const { status , canAskAgain} = await Audio.requestPermissionsAsync();
    console.log(status, canAskAgain, 'check status')
      if(status !== 'granted'){
        if (!canAskAgain && status === 'denied') {
          alert('Please enable microphone permission from Settings');
          return false;
        }else{
          //setMicrophonePermisstion(false);
          //setStatus('mic-off');
          alert('please allow permission');
          return false;
        }
        
      }else{
      // setMicrophonePermisstion(true);
        return true;
       // setStatus('idle');
      }
  }

  export async function requestMicAndroid() {
    console.log('Platform:', Platform.OS);
    if (Platform.OS === 'android') {
        console.log('Platform:', Platform.OS);
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Access',
          message: 'App needs access to your mic to record audio',
          buttonPositive: 'Allow',
        }
      );
      console.log('Granted:', granted);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  }