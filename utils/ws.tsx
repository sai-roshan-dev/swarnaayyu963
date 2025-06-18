import * as FileSystem from 'expo-file-system';

export function connectToAgent(signedUrl: string, onAudio: (uri: string) => void): WebSocket {
  const ws = new WebSocket(signedUrl);
  ws.binaryType = 'arraybuffer';

  const audioChunks: ArrayBuffer[] = [];

  ws.onopen = () => {
    console.log('✅ WebSocket connected');
  };

  ws.onmessage = (event) => {
    if (typeof event.data === 'string') {
      try {
        const json = JSON.parse(event.data);
        console.log('📝 JSON message:', JSON.stringify(json, null, 2));
      } catch {
        console.warn('⚠️ Received string data that is not JSON:', event.data);
      }
      return;
    }

    if (event.data instanceof ArrayBuffer) {
      audioChunks.push(event.data);
      console.log('🔊 Received audio chunk of size:', event.data.byteLength);
    } else {
      console.warn('⚠️ Unexpected message type:', typeof event.data);
    }
  };

  ws.onclose = async () => {
    console.log('🔒 WebSocket closed');

    if (audioChunks.length === 0) {
      console.warn('⚠️ No audio chunks received');
      return;
    }

    const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
    console.log('📦 Final audio blob size:', audioBlob.size);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          const path = FileSystem.documentDirectory + `response-${Date.now()}.mp3`;

          await FileSystem.writeAsStringAsync(path, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          console.log('✅ Audio file saved at:', path);
          onAudio(path);
        } catch (writeErr) {
          console.error('❌ Failed saving audio file:', writeErr);
        }
      };
      reader.onerror = (err) => {
        console.error('❌ FileReader error:', err);
      };

      reader.readAsDataURL(audioBlob);
    } catch (err) {
      console.error('❌ Error creating audio blob:', err);
    }
  };

  ws.onerror = (err) => {
    console.error('❌ WebSocket error:', err);
  };

  return ws;
}
