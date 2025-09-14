import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import {
  Send,
  Sparkles,
  Utensils,
  TrendingUp,
  Clock
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Service for AI Recommendations
const AUTH_TOKEN_KEY = "auth_token";

const sendMessageToAI = async (userId: string, message: string): Promise<string> => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/recommend/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({
        userId,
        message: message.trim(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get AI response');
    }

    const data = await response.json();
    return data.reply || 'Sorry, I couldn\'t process your request right now.';
  } catch (error) {
    console.error('AI API Error:', error);
    throw error;
  }
};

const Button = ({
  variant = 'default',
  size = 'md',
  disabled = false,
  onPress,
  children,
  className = ''
}: any) => {
  const base = 'flex-row items-center justify-center rounded-xl px-4';
  const sizes: any = {
    sm: 'h-8',
    md: 'h-12',
    icon: 'h-12 w-12'
  };
  const styles =
    variant === 'default'
      ? 'bg-blue-500'
      : variant === 'outline'
        ? 'border border-gray-300'
        : 'bg-transparent';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${styles} ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {children}
    </TouchableOpacity>
  );
};

const Input = ({
  value,
  onChangeText,
  placeholder,
  onSubmitEditing,
  className = ''
}: any) => (
  <TextInput
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    placeholderTextColor="#9CA3AF"
    onSubmitEditing={onSubmitEditing}
    className={`flex-1 h-12 px-4 rounded-xl bg-gray-100 dark:bg-neutral-800 text-black dark:text-white ${className}`}
  />
);

// --- Message Interface ---
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// --- Main Chat Screen ---
export default function ChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content:
        "Hi! I'm your AI nutritionist assistant. I can help you log meals, track progress, and give personalized recommendations. What would you like to know today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const quickSuggestions = [
    { text: 'Log my breakfast', icon: Utensils },
    { text: "How's my progress?", icon: TrendingUp },
    { text: 'Suggest dinner', icon: Sparkles },
    { text: 'Weekly summary', icon: Clock }
  ];

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !user?.id || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);
    setIsLoading(true);

    try {
      const aiResponse = await sendMessageToAI(user.id, currentInput);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I\'m having trouble connecting right now. Please check your internet connection and try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);

      // Show alert for debugging in development
      if (__DEV__) {
        Alert.alert('API Error', `Failed to get AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };


  // Show loading or error state if user is not available
  if (!user) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-neutral-950 justify-center items-center p-4">
        <Text className="text-lg text-gray-600 dark:text-gray-400 text-center">
          Please log in to access the AI nutritionist assistant.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="bg-gray-50 dark:bg-neutral-950"
    >
      {/* Header */}
      <View className="p-4 border-b border-gray-200 dark:border-neutral-800 flex-row items-center gap-3 mt-4">
        <View className="w-14 h-14 bg-black rounded-full items-center justify-center">
          <Sparkles size={30} color="white" />
        </View>
        <View>
          <Text className="text-xl text-black dark:text-white">NutriAI Assistant</Text>
          <Text className="text-lg text-gray-500">Always here to help</Text>
        </View>
      </View>

      {/* Daily Summary Card */}
      <View className="p-4 border-b border-gray-200 dark:border-neutral-800">
        <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <View className="p-3">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-black dark:text-white">Today's Summary</Text>
              <Text className="text-xs text-gray-500">Dec 5</Text>
            </View>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-lg text-blue-500">1,850</Text>
                <Text className="text-xs text-gray-500">kcal</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg text-green-600">95g</Text>
                <Text className="text-xs text-gray-500">protein</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg text-blue-600">180g</Text>
                <Text className="text-xs text-gray-500">carbs</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg text-orange-500">65g</Text>
                <Text className="text-xs text-gray-500">fats</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {messages.map(message => (
          <View
            key={message.id}
            className={`flex mb-3 ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <View
              className={`max-w-[80%] p-3 rounded-2xl ${message.sender === 'user'
                ? 'bg-blue-500'
                : 'bg-gray-200 dark:bg-neutral-800'
                }`}
            >
              <Text
                className={`text-sm ${message.sender === 'user' ? 'text-white' : 'text-black dark:text-white'
                  }`}
              >
                {message.content}
              </Text>
              <Text className="text-xs mt-1 text-gray-400">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>
        ))}

        {isTyping && (
          <View className="items-start">
            <View className="bg-gray-200 dark:bg-neutral-800 p-3 rounded-2xl flex-row space-x-1">
              <View className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <View className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <View className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick Suggestions + Input */}
      <View className="p-4 border-t border-gray-200 dark:border-neutral-800">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          <View className="flex-row gap-2">
            {quickSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onPress={() => setInputValue(suggestion.text)}
                className="flex-row items-center gap-1 px-3"
              >
                <suggestion.icon size={14} color="black" />
                <Text className="text-xs text-black dark:text-white">{suggestion.text}</Text>
              </Button>
            ))}
          </View>
        </ScrollView>

        <View className="flex-row gap-2">
          <Input
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Ask about meals, progress, or get suggestions..."
            onSubmitEditing={handleSend}
          />
          <Button
            size="icon"
            onPress={handleSend}
            disabled={!inputValue.trim() || isLoading || !user?.id}
            className="bg-blue-500"
          >
            <Send size={18} color="white" />
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
