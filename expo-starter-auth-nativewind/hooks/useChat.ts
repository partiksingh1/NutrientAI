import { useState, useEffect, useRef } from "react";
import { Alert, Keyboard, ScrollView } from "react-native";

import {
  clearConversation,
  fetchConversationMessages,
  sendMessageToAI,
} from "@/services/recommendService";
import { LocalMessage } from "@/types/recommend";
import { i18n } from "@/lib/i18next";

interface UseChatParams {
  userId: string | null;
}

export const useChat = ({ userId }: UseChatParams) => {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load conversation messages
  const loadConversationMessages = async () => {
    if (!userId) return;
    setIsLoadingMessages(true);

    try {
      const localMessages = await fetchConversationMessages();
      setMessages(localMessages);
    } catch (error) {
      Alert.alert(i18n.t("chat.error"), i18n.t("chat.loadError"));
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Clear conversation with confirmation
  const clearConversationMessages = async () => {
    Alert.alert(
      i18n.t("chat.clearConfirmTitle"),
      i18n.t("chat.clearConfirmSubtitle"),
      [
        { text: i18n.t("chat.cancel"), style: "cancel" },
        {
          text: i18n.t("chat.clear"),
          style: "destructive",
          onPress: async () => {
            try {
              await clearConversation();
              setMessages([]);
            } catch (error) {
              console.error(error);
            }
          },
        },
      ],
    );
  };

  // Send a message to AI
  const handleSend = async () => {
    Keyboard.dismiss();
    if (!inputValue.trim() || !userId || isLoading) return;

    const userMessage: LocalMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsTyping(true);
    setIsLoading(true);

    try {
      const aiResponse = await sendMessageToAI(userId, currentInput);

      const aiMessage: LocalMessage = {
        id: aiResponse.messageId
          ? aiResponse.messageId.toString()
          : (Date.now() + 1).toString(),
        content: aiResponse.reply,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: i18n.t("chat.offlineError"),
          sender: "ai",
          timestamp: new Date(),
        },
      ]);

      if (__DEV__) {
        Alert.alert(
          i18n.t("chat.apiError"),
          `${i18n.t("chat.apiErrorDetail")}: ${error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Scroll on message update
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  // Load messages on mount
  useEffect(() => {
    loadConversationMessages();
  }, [userId]);

  return {
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
  };
};
