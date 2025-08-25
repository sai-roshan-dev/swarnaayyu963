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
  StyleSheet,
  Animated
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAddChatMessage, useMessages } from '@/hooks/useChatMessages';
import { formatChatTimestamp } from '@/components/utilities/timestampfomat';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/context/LanguageContext';
import { ThemedText } from '@/components/ThemedText';

type MessageType = {
  user_message: string;
  bot_response: string;
  timestamp: string;
  channel: string;
  mode: string;
  audio_url: string | null;
};

const MESSAGES_PER_PAGE = 20;

// WhatsApp-like animated typing dots component
const TypingDots = () => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(dot1, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(dot1, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(dot1, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]),
      ]).start(() => animate());
    };
    animate();
    return () => {
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, { opacity: dot1 }]} />
      <Animated.View style={[styles.dot, { opacity: dot2, marginHorizontal: 4 }]} />
      <Animated.View style={[styles.dot, { opacity: dot3 }]} />
    </View>
  );
};

const ChatScreen = () => {
  const [newMessage, setNewMessage] = useState('');
  const [page, setPage] = useState(1);
  const [displayedMessages, setDisplayedMessages] = useState<MessageType[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const flatListRef = useRef<FlatList<MessageType>>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const router = useRouter();
  const { t } = useLanguage();

  const { data: chatMessages, isLoading } = useMessages();
  const { mutate: addMessage } = useAddChatMessage();

  useEffect(() => {
    if (!Array.isArray(chatMessages)) return;

    const validMessages = chatMessages.filter(msg =>
      msg &&
      (
        (
          msg.user_message &&
          msg.bot_response &&
          msg.user_message !== "undefined" &&
          msg.bot_response !== "undefined"
        )
        ||
        msg.audio_url // include audio-only messages
      )
    );

    const sorted = [...validMessages].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
      
    const totalToShow = page * MESSAGES_PER_PAGE;
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
    if (!item.user_message && !item.audio_url) return null;
    return (
      <View style={styles.messagePairContainer}>
        {/* User Message or Audio */}
        <View style={[styles.messageContainer, styles.myMessageContainer]}>
          <View style={[styles.messageBubble, styles.myMessageBubble]}>
            <View style={styles.messageHeader}>
              {item.audio_url ? (
                <AudioPlayer url={item.audio_url} />
              ) : (
                <ThemedText style={styles.messageText}>{item.user_message}</ThemedText>
              )}
            </View>
            <Text style={[styles.timestamp, styles.myTimestamp]}>
              <View style={[styles.whatsappicon]}>
                {item.channel === 'whatsapp' && (
                  <Ionicons name="logo-whatsapp" size={16} color="#0b7d37" style={styles.channelIcon} />
                )}
              </View>
              {formatChatTimestamp(item.timestamp)}
            </Text>
          </View>
        </View>

        {/* Bot Response */}
        {item.bot_response && (
          <View style={[styles.messageContainer, styles.otherMessageContainer]}>
            <View style={[styles.messageBubble, styles.otherMessageBubble]}>
              <View style={styles.messageHeader}>
                {item.bot_response === "Typing..." ? (
                  <TypingDots />
                ) : (
                  <ThemedText style={styles.messageText}>{item.bot_response}</ThemedText>
                )}
              </View>
              {item.bot_response !== "Typing..." && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  {item.channel === 'whatsapp' && (
                    <Ionicons name="logo-whatsapp" size={16} color="#0b7d37" style={{ marginRight: 4, marginBottom: -2 }} />
                  )}
                  <Text style={[styles.timestamp, styles.otherTimestamp]}>
                    {formatChatTimestamp(item.timestamp)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  // AudioPlayer component for playing audio_url
  const AudioPlayer = ({ url }: { url: string }) => {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);
    const [shouldPlayAfterSeek, setShouldPlayAfterSeek] = useState(false);

    const loadSound = async () => {
      if (sound) return;
      const { sound: newSound, status } = await Audio.Sound.createAsync({ uri: url }, {}, onPlaybackStatusUpdate);
      setSound(newSound);
      soundRef.current = newSound;
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
        setPosition(status.positionMillis || 0);
      }
    };

    const onPlaybackStatusUpdate = (status: any) => {
      if (!status.isLoaded) return;
      if (!isSeeking) setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      setIsPlaying(status.isPlaying);
    };

    const togglePlayPause = async () => {
      await loadSound();
      const currentSound = sound;
      if (!currentSound) return;

      const status: any = await currentSound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await currentSound.pauseAsync();
      } else if (status.isLoaded) {
        await currentSound.playAsync();
      }
    };

    const onSeekSliderValueChange = (value: number) => {
      setIsSeeking(true);
      setPosition(value);
    };

    const onSeekSliderSlidingComplete = async (value: number) => {
      if (sound) {
        await sound.setPositionAsync(value);
        setIsSeeking(false);
        if (shouldPlayAfterSeek) {
          await sound.playAsync();
        }
      }
    };

    useEffect(() => {
      loadSound();
      return () => {
        if (soundRef.current) {
          soundRef.current.stopAsync();
          soundRef.current.unloadAsync();
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    return (
      <View style={{ width: '100%' }}>
        <TouchableOpacity onPress={togglePlayPause} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#007AFF" style={{ marginRight: 6 }} />
          <ThemedText style={{ color: '#007AFF', fontWeight: 'bold' }}>{isPlaying ? t('pause') : t('play_audio')}</ThemedText>
        </TouchableOpacity>
        <Slider
          style={{ width: '100%', height: 20 }}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onValueChange={onSeekSliderValueChange}
          onSlidingStart={() => {
            setShouldPlayAfterSeek(isPlaying);
            if (isPlaying && sound) sound.pauseAsync();
          }}
          onSlidingComplete={onSeekSliderSlidingComplete}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#007AFF"
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 10 }}>{formatMillis(position)}</Text>
          <Text style={{ fontSize: 10 }}>{formatMillis(duration)}</Text>
        </View>
      </View>
    );
  };

  function formatMillis(millis: number) {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  return (
    <View style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
      <TouchableOpacity onPress={() => router.back()}> 
          <Ionicons name="arrow-back" size={28} color="#222" />
      </TouchableOpacity>
        <ThemedText type="title" style={styles.navbarTitle}>{t('history')}</ThemedText>
        <View style={{ width: 28 }} />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <FlatList
          ref={flatListRef}
          data={displayedMessages}
          keyExtractor={(item, index) => `${item.timestamp}-${index}`}
          renderItem={renderMessage}
          inverted
          contentContainerStyle={styles.messagesList}
          onEndReached={() => {
            if (chatMessages && page * MESSAGES_PER_PAGE < chatMessages.length) {
              setPage(prev => prev + 1);
              setIsLoadingMore(true);
            }
          }}
          onEndReachedThreshold={0.1}
          ListHeaderComponent={
            isLoadingMore ? <ActivityIndicator size="large" style={{ marginVertical: 8 }} /> : null
          }
          ListFooterComponent={
            displayedMessages.length > 0 && displayedMessages[0].bot_response === t('typing') ? (
              <TypingDots />
            ) : null
          }
        />

        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder={t('type_message')}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
              disabled={newMessage.trim() === ''}>
              <Ionicons name="send" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 0,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  navbarTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
  },
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
  whatsappicon:{
    marginTop:6.7,
    
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
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  channelIcon: {
    marginRight: 6,
  },
  
  typingContainer: {
    padding: 10,
    alignItems: 'flex-start',
    marginLeft: 10,
  },
  typingText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#555',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#888',
  },
});

export default ChatScreen;
