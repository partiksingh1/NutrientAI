import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Modal
} from 'react-native';
import {
  Send,
  Sparkles,
  Utensils,
  TrendingUp,
  Clock,
  MessageSquare,
  Trash2,
  X,
  Plus
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../hooks/useChat';
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


// --- Main Chat Screen ---
export default function ChatScreen() {
  const { user } = useAuth();

  const {
    messages,
    conversations,
    inputValue,
    isTyping,
    isLoading,
    isLoadingConversations,
    showConversations,
    currentConversationId,
    scrollViewRef,

    setInputValue,
    setShowConversations,
    setCurrentConversationId,
    startNewConversation,
    handleSend,
    deleteConversation,
    loadConversations,
  } = useChat({ userId: user?.id || null });


  const quickSuggestions = [
    { text: 'Log my breakfast', icon: Utensils },
    { text: "How's my progress?", icon: TrendingUp },
    { text: 'Suggest dinner', icon: Sparkles },
    { text: 'Weekly summary', icon: Clock }
  ];


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
            onPress={() => setShowConversations(true)}
            className="w-10 h-10"
          >
            <MessageSquare size={18} color="black" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onPress={startNewConversation}
            className="w-10 h-10"
          >
            <Plus size={18} color="black" />
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
      >
        {messages.length === 0 && (
          <View className="flex-1 justify-center items-center p-8">
            <Text className="text-gray-500">No messages yet</Text>
          </View>
        )}
        {messages.map(message => {
          console.log('Rendering message:', message.id, message.sender, message.content.substring(0, 50));
          return (
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
                <Text className="text-black dark:text-white">
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
          );
        })}

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

      {/* Conversations Modal */}
      <Modal
        visible={showConversations}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-gray-50 dark:bg-neutral-950">
          {/* Modal Header */}
          <View className="p-4 border-b border-gray-200 dark:border-neutral-800 flex-row items-center justify-between">
            <Text className="text-xl font-semibold text-black dark:text-white">Conversations</Text>
            <Button
              size="icon"
              variant="outline"
              onPress={() => setShowConversations(false)}
              className="w-8 h-8"
            >
              <X size={16} color="black" />
            </Button>
          </View>

          {/* Conversations List */}
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id.toString()}
            refreshing={isLoadingConversations}
            onRefresh={loadConversations}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  console.log('Selected conversation:', item.id);
                  setCurrentConversationId(item.id);
                  setShowConversations(false);
                }}
                className={`p-4 border-b border-gray-200 dark:border-neutral-800 ${currentConversationId === item.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-medium text-black dark:text-white" numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1">
                      {new Date(item.updatedAt).toLocaleDateString()} at{' '}
                      {new Date(item.updatedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                    {item.messages && item.messages.length > 0 && (
                      <Text className="text-sm text-gray-400 mt-1" numberOfLines={1}>
                        {item.messages[0].content}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteConversation(item.id)}
                    className="p-2"
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center p-8">
                <MessageSquare size={48} color="#9CA3AF" />
                <Text className="text-lg text-gray-500 mt-4 text-center">
                  No conversations yet
                </Text>
                <Text className="text-sm text-gray-400 mt-2 text-center">
                  Start a new conversation to get personalized nutrition advice
                </Text>
                <Button
                  onPress={startNewConversation}
                  className="mt-4"
                >
                  <Text className="text-white font-medium">Start New Chat</Text>
                </Button>
              </View>
            }
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
