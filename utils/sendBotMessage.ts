// utils/sendBotMessage.ts
import axios from 'axios';

export async function sendBotMessage(conversation_id: string, authToken: string) {
  const url = 'https://bot.swarnaayu.com/conversation/chat/';

  const body = {
    message: 'can you tell the weather in the razole, east godavari district, ap',
    mode: 'voice',
    conversation_id: `${conversation_id}`,
  };

  try {
    const res = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${authToken}`,
      },
    });

    return res.data; // axios automatically parses JSON
  } catch (error: any) {
    throw new Error(
      error.response
        ? `Failed: ${error.response.status} - ${error.response.data}`
        : `Network error: ${error.message}`
    );
  }
}
