import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAddChatMessage, useMessages } from '@/hooks/useChatMessages';
import { formatChatTimestamp } from '@/components/utilities/timestampfomat';

type MessageType = {
  user_message: string;
  bot_response: string;
  timestamp: string;
};

const MESSAGES_PER_PAGE = 20;

const ChatScreen = () => {
  const [newMessage, setNewMessage] = useState('');
  const [page, setPage] = useState(1);
  const [displayedMessages, setDisplayedMessages] = useState<MessageType[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const flatListRef = useRef<FlatList<MessageType>>(null);

  const { data: chatMessages, isLoading } = useMessages();
  const { mutate: addMessage } = useAddChatMessage();

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    if (!Array.isArray(chatMessages)) return;
  
    const totalMessages = chatMessages.length || 0;
    const totalToShow = page * MESSAGES_PER_PAGE;
  
    // Filter out invalid messages first
    const validMessages = chatMessages.filter(msg => 
      msg && 
      msg.user_message && 
      msg.bot_response && 
      msg.user_message !== "undefined" && 
      msg.bot_response !== "undefined"
    );
  
    const sorted = [...validMessages].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  
    const sliced = sorted.slice(0, totalToShow);
  
    const optimisticMessages = chatMessages.filter((msg) =>
      msg.bot_response === "Typing..."
    );
  
    const merged = [
      ...sliced,
      ...optimisticMessages.filter(
        (om) => !sliced.some((m) => m.timestamp === om.timestamp)
      ),
    ];
  
    setDisplayedMessages(merged);
    setIsLoadingMore(false);
  }, [chatMessages, page]);

  const handleSend = () => {
    if (newMessage.trim() === '') return;
    addMessage(newMessage);
    setNewMessage('');
  };

  const renderMessage = ({ item }: { item: MessageType }) => {
    // Skip rendering if either message is empty or invalid
    if (!item.user_message || !item.bot_response || 
        item.user_message === "undefined" || item.bot_response === "undefined") {
      return null;
    }

    return (
      <View style={styles.messagePairContainer}>
        {/* User Message */}
        <View style={[styles.messageContainer, styles.myMessageContainer]}>
          <View style={[styles.messageBubble, styles.myMessageBubble]}>
            <Text style={styles.messageText}>{item.user_message}</Text>
            <Text style={[styles.timestamp, styles.myTimestamp]}>
              {formatChatTimestamp(item.timestamp)}
            </Text>
          </View>
        </View>

        {/* Bot Response */}
        <View style={[styles.messageContainer, styles.otherMessageContainer]}>
          <View style={[styles.messageBubble, styles.otherMessageBubble]}>
            <Text style={styles.messageText}>{item.bot_response}</Text>
            <Text style={[styles.timestamp, styles.otherTimestamp]}>
              {formatChatTimestamp(item.timestamp)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isLoadingMore && <ActivityIndicator size="large" style={{ marginVertical: 8 }} />}

      <View style={styles.content}>
        <FlatList
          ref={flatListRef}
          data={displayedMessages}
          keyExtractor={(item, index) => `${item.timestamp}-${index}`}
          renderItem={renderMessage}
          inverted
          contentContainerStyle={styles.messagesList}
          onEndReached={() => {
            if (chatMessages && page * MESSAGES_PER_PAGE < chatMessages.length) {
              setPage((prev) => prev + 1);
              setIsLoadingMore(true);
            }
          }}
          onEndReachedThreshold={0.1}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputWrapper}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={newMessage.trim() === ''}
          >
            <Ionicons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  content: { flex: 1, marginBottom: 60 },
  messagesList: { paddingHorizontal: 15, paddingBottom: 10 },
  messageContainer: { marginVertical: 2, flexDirection: 'row' },
  myMessageContainer: { justifyContent: 'flex-end' },
  otherMessageContainer: { justifyContent: 'flex-start' },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginVertical: 2,
  },
  myMessageBubble: {
    backgroundColor: '#73a0ff',
    borderBottomRightRadius: 1,
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 1,
  },
  messageText: { fontSize: 16, color: '#000' },
  timestamp: { fontSize: 12, marginTop: 2 },
  myTimestamp: { color: '#666', alignSelf: 'flex-end' },
  otherTimestamp: { color: '#666', alignSelf: 'flex-end' },
  inputWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#5094f8',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagePairContainer: {
    marginVertical: 8,
  },
});

export default ChatScreen;
