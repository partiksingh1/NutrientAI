import {
  Send,
  Sparkles,
  TrendingUp,
  Clock,
  Trash2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { useAuth } from "../../context/AuthContext";
import Button from "@/components/chat/Button";
import Input from "@/components/chat/Input";
import TypingIndicator from "@/components/chat/TypeIndicator";
import { useChat } from "@/hooks/useChat";
import MessageBubble from "@/components/chat/MessageBubble";
import EmptyState from "@/components/chat/EmptyState";

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
  } = useChat({ userId: user?.id ?? null });

  const [refreshing, setRefreshing] = useState(false);

  const quickSuggestions = [
    { text: "How's my progress?", icon: TrendingUp },
    { text: "Suggest dinner", icon: Sparkles },
    { text: "Weekly summary", icon: Clock },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversationMessages();
    setRefreshing(false);
  };

  const handleSuggestionPress = (text: string) => {
    setInputValue(text);
  };

  if (isLoadingMessages) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-neutral-950 justify-center items-center p-6">
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-neutral-950 justify-center items-center p-6">
        <Text className="text-lg text-gray-600 dark:text-gray-400 text-center">
          Please log in to access the AI nutritionist assistant.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={30}
      className="bg-gray-50 dark:bg-neutral-950"
    >
      {/* Header */}
      <View className="p-6 border-b border-gray-200 dark:border-neutral-800 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-14 h-14 bg-green-600 rounded-full items-center justify-center">
            <Sparkles size={30} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-xl text-black dark:text-white">BalancedBite's AI</Text>
            <Text className="text-md text-gray-500">Personalized Assistant</Text>
          </View>
        </View>
        <Button
          size="icon"
          variant="outline"
          onPress={clearConversationMessages}
          className="w-10 h-10"
        >
          <Trash2 size={18} color="black" />
        </Button>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-6"
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        {messages.length === 0 && <EmptyState />}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isTyping && <TypingIndicator />}
      </ScrollView>

      {/* Suggestions + Input */}
      <View className="p-4 border-t border-gray-200 dark:border-neutral-800">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          <View className="flex-row gap-2">
            {quickSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onPress={() => handleSuggestionPress(suggestion.text)}
                className="flex-row items-center gap-1 px-3 py-1 rounded-full"
              >
                <suggestion.icon size={16} color="#6B7280" />
                <Text className="text-xs text-gray-700 dark:text-gray-300">
                  {suggestion.text}
                </Text>
              </Button>
            ))}
          </View>
        </ScrollView>

        <View className="flex-row gap-2">
          <Input
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Ask about progress, or get suggestions..."
            onSubmitEditing={handleSend}
            maxLength={500}
            multiline
          />
          <Button
            size="icon"
            onPress={handleSend}
            disabled={!inputValue.trim() || isLoading || !user?.id}
            className={`w-12 h-12 rounded-full items-center justify-center ${!inputValue.trim() || isLoading ? "bg-gray-300" : "bg-green-600"
              }`}
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
