import { Toast } from "toastify-react-native";

import { LocalMessage, Conversation, AIResponse } from "@/types/recommend";
import { fetchWithAuth } from "@/utils/apiWithAuth";
import { i18n } from "@/lib/i18next";

export const sendMessageToAI = async (userId: string, message: string): Promise<AIResponse> => {
  try {
    const response = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/recommend/ai`, {
      method: "POST",
      body: JSON.stringify({ userId, message: message.trim() }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get AI response");
    }

    const data: AIResponse = await response.json();

    // Only show success toast for first message or errors
    if (data.cached) {
      Toast.show({
        type: "info",
        text1: i18n.t("toast.cachedResponse.title"),
        text2: i18n.t("toast.cachedResponse.msg"),
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
      });
    }

    return data;
  } catch (error: any) {
    Toast.show({
      type: "error",
      text1: i18n.t("toast.sendMessageError.title"),
      text2: error.message || i18n.t("toast.sendMessageError.msg"),
      position: "top",
      visibilityTime: 3000,
      autoHide: true,
    });
    throw error;
  }
};
export const fetchConversationMessages = async (): Promise<LocalMessage[]> => {
  try {
    const response = await fetchWithAuth(
      `${process.env.EXPO_PUBLIC_API_URL}/recommend/conversation`,
      {
        method: "GET",
      },
    );
    const data = await response.json();
    console.log(data);
    const messages = data.conversation.messages;
    console.log(messages);
    return messages.map((msg: any) => ({
      id: msg.id.toString(),
      content: msg.content,
      sender: msg.senderRole === "USER" ? "user" : "ai",
      timestamp: new Date(msg.createdAt),
    }));
  } catch (error: any) {
    // Only show error toast for critical failures
    if (error.response?.status >= 500) {
      Toast.show({
        type: "error",
        text1: i18n.t("toast.connectionError.title"),
        text2: i18n.t("toast.connectionError.msg"),
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
      });
    }
    throw error;
  }
};

export const clearConversation = async (): Promise<void> => {
  try {
    await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/recommend/conversation`, {
      method: "DELETE",
    });

    Toast.show({
      type: "success",
      text1: i18n.t("toast.conversationCleared.title"),
      position: "top",
      visibilityTime: 3000,
      autoHide: true,
    });
  } catch (error: any) {
    Toast.show({
      type: "error",
      text1: i18n.t("toast.conversationClearFailed.title"),
      text2: error.message || i18n.t("toast.conversationClearFailed.msg"),
      position: "top",
      visibilityTime: 3000,
      autoHide: true,
    });
    throw error;
  }
};
