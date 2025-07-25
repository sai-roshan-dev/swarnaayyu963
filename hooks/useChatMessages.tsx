import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { useIsFocused } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { API_ENDPOINTS } from "@/config/api";

// Types matching the API response
type ConversationHistory = {
  user_message: string;
  bot_response: string;
  timestamp: string;
  channel: string;
  mode: string;
  audio_url: string | null;
};

type UserInfo = {
  full_name: string;
  phone_number: string;
  age: number;
  gender: string;
};

type ConversationResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    user: UserInfo;
    conversation_history: ConversationHistory[];
  };
};

type ChatResponse = {
  phone_number: string;
  response: string;
};

// Fetch messages from server with Token auth
const fetchMessages = async (): Promise<ConversationHistory[]> => {
  const token = await SecureStore.getItemAsync("token");
  if (!token) {
    return []; // Return empty array if no token
  }

  let allMessages: ConversationHistory[] = [];
  let nextUrl: string | null = API_ENDPOINTS.CONVERSATION_HISTORY;

  try {
    while (nextUrl) {
      const response: AxiosResponse<ConversationResponse> = await axios.get<ConversationResponse>(
        nextUrl,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );
      // Map each message to flatten transcript fields
      const mappedMessages = (response.data.results.conversation_history || []).map((msg: any) => ({
        user_message: msg.transcript?.user_message || "",
        bot_response: msg.transcript?.bot_response || "",
        timestamp: msg.timestamp,
        channel: msg.channel,
        mode: msg.mode,
        audio_url: msg.audio_url,
      }));
      allMessages = allMessages.concat(mappedMessages);
      nextUrl = response.data.next;
    }
    return allMessages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return []; // Return empty array on error
  }
};

// React Query hook to fetch messages with refetch on focus
export function useMessages() {
  const isFocused = useIsFocused();

  return useQuery({
    queryKey: ["messages"],
    queryFn: fetchMessages,
    enabled: isFocused,
    refetchInterval: isFocused ? 2000 : false,
    retry: 1, // Only retry once on failure
  });
}

// Send message to server with Token auth
const postChatMessage = async (newChatMessage: string): Promise<ChatResponse> => {
  const token = await SecureStore.getItemAsync("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await axios.post<ChatResponse>(
    API_ENDPOINTS.CHAT,
    {
      message: newChatMessage,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  return response.data;
};

// Hook for sending a message with optimistic update
export function useAddChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postChatMessage,

    onMutate: async (newMessage: string) => {
      await queryClient.cancelQueries({ queryKey: ["messages"] });

      const previousMessages = queryClient.getQueryData<ConversationHistory[]>(["messages"]);

      const optimisticMessage: ConversationHistory = {
        user_message: newMessage,
        bot_response: "Typing...",
        timestamp: new Date().toISOString(),
        channel: "",
        mode: "",
        audio_url: null,
      };

      queryClient.setQueryData<ConversationHistory[]>(["messages"], (old = []) => [
        ...old,
        optimisticMessage,
      ]);

      return { previousMessages };
    },

    onError: (_err, _newMessage, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(["messages"], context.previousMessages);
      }
    },

    onSuccess: (savedMessage, variables) => {
      queryClient.setQueryData<ConversationHistory[]>(["messages"], (old = []) => {
        const withoutTemp = old.filter((msg) => msg.bot_response !== "Typing...");
        return [...withoutTemp, {
          user_message: variables, // Use the original user message
          bot_response: savedMessage.response,
          timestamp: new Date().toISOString(),
          channel: "",
          mode: "",
          audio_url: null,
        }];
      });

      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}
