// utils/sendBotMessage.ts

export async function sendBotMessage(conversation_id: string, authToken: string) {
  const url = 'https://bot.swarnaayu.com//conversation/chat/';
  const body = {
    message: 'can you tell the weather in the razole, east godavari district, ap',
    mode: 'voice',
    conversation_id,
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${authToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error('Failed to send message to bot');
  }
  return res.json();
}
