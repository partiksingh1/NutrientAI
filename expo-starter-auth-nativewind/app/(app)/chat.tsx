import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import {
  Send,
  Sparkles,
  Utensils,
  TrendingUp,
  Clock,
  Trash2
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '@/hooks/useChat';
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
  className = '',
  maxLength = 500,
  multiline = false
}: any) => (
  <TextInput
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    placeholderTextColor="#9CA3AF"
    onSubmitEditing={onSubmitEditing}
    maxLength={maxLength}
    multiline={multiline}
    textAlignVertical={multiline ? 'top' : 'center'}
    className={`flex-1 ${multiline ? 'min-h-12 max-h-24' : 'h-12'} px-4 rounded-xl bg-gray-100 dark:bg-neutral-800 text-black dark:text-white ${className}`}
  />
);


// --- Main Chat Screen ---
export default function ChatScreen() {
  const { user } = useAuth();

  const {
    messages,
    inputValue,
    isTyping,
    isLoading,
    isLoadingMessages,
    scrollViewRef,

    setInputValue,
    handleSend,
    clearConversationMessages,
    loadConversationMessages,
  } = useChat({ userId: user?.id || null });

  const [refreshing, setRefreshing] = useState(false);

  const quickSuggestions = [
    { text: 'Log my breakfast', icon: Utensils },
    { text: "How's my progress?", icon: TrendingUp },
    { text: 'Suggest dinner', icon: Sparkles },
    { text: 'Weekly summary', icon: Clock }
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversationMessages();
    setRefreshing(false);
  };

  const handleSuggestionPress = (text: string) => {
    setInputValue(text);
    // Auto-focus input after setting value
    setTimeout(() => {
      // Focus will be handled by the input component
    }, 100);
  };


  // Show loading state while messages are loading
  if (isLoadingMessages) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-neutral-950 justify-center items-center p-4">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-lg text-gray-600 dark:text-gray-400 text-center mt-4">
          Loading conversation...
        </Text>
      </View>
    );
  }

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
      <View className="p-4 border-b border-gray-200 dark:border-neutral-800 flex-row items-center justify-between mt-4">
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-14 h-14 bg-black rounded-full items-center justify-center">
            <Sparkles size={30} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-xl text-black dark:text-white">NutriAI Assistant</Text>
            <Text className="text-lg text-gray-500">Always here to help</Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          <Button
            size="icon"
            variant="outline"
            onPress={clearConversationMessages}
            className="w-10 h-10"
          >
            <Trash2 size={18} color="black" />
          </Button>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
          />
        }
      >
        {messages.length === 0 && (
          <View className="flex-1 justify-center items-center p-8">
            <View className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full items-center justify-center mb-4">
              <Sparkles size={32} color="#3B82F6" />
            </View>
            <Text className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Welcome to NutriAI!
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
              I'm your personal nutrition assistant. Ask me about meals, track your progress, or get personalized recommendations.
            </Text>
            <Text className="text-sm text-gray-400 text-center">
              Try one of the suggestions below to get started
            </Text>
          </View>
        )}
        {messages.map((message) => {
          const isUser = message.sender === 'user';
          const time = new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <View
              key={message.id}
              className={`flex mb-3 ${isUser ? 'items-end' : 'items-start'}`}
            >
              <View
                className={`max-w-[85%] p-3 rounded-2xl ${isUser ? 'bg-blue-500' : 'bg-gray-200 dark:bg-neutral-800'
                  }`}
              >
                {message.content.split('\n').map((line, index) => (
                  <Text
                    key={index}
                    className={`${isUser ? 'text-white' : 'text-black dark:text-white'} mb-1`}
                  >
                    {line.trim()}
                  </Text>
                ))}
                <Text
                  className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-400'
                    }`}
                >
                  {time}
                </Text>
              </View>
            </View>
          );
        })}

        {isTyping && (
          <View className="items-start">
            <View className="bg-gray-200 dark:bg-neutral-800 p-3 rounded-2xl flex-row items-center space-x-2">
              <ActivityIndicator size="small" color="#6B7280" />
              <Text className="text-gray-500 text-sm">AI is thinking...</Text>
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
                onPress={() => handleSuggestionPress(suggestion.text)}
                className="flex-row items-center gap-1 px-3"
              >
                <suggestion.icon size={14} color="#6B7280" />
                <Text className="text-xs text-gray-700 dark:text-gray-300">{suggestion.text}</Text>
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
            maxLength={500}
            multiline={true}
          />
          <Button
            size="icon"
            onPress={handleSend}
            disabled={!inputValue.trim() || isLoading || !user?.id}
            className={`${!inputValue.trim() || isLoading ? 'bg-gray-300' : 'bg-blue-500'}`}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Send size={18} color="white" />
            )}
          </Button>
        </View>
        {inputValue.length > 400 && (
          <Text className="text-xs text-gray-400 mt-1 text-right">
            {inputValue.length}/500 characters
          </Text>
        )}
      </View>

    </KeyboardAvoidingView>
  );
}
