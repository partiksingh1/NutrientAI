import { LocalMessage, Conversation, AIResponse } from '@/types/recommend';
import { Toast } from 'toastify-react-native';
import { fetchWithAuth } from '@/utils/apiWithAuth';

export const sendMessageToAI = async (userId: string, message: string): Promise<AIResponse> => {
    try {
        const response = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/recommend/ai`, {
            method: 'POST',
            body: JSON.stringify({ userId, message: message.trim() }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get AI response');
        }

        const data: AIResponse = await response.json();

        // Only show success toast for first message or errors
        if (data.cached) {
            Toast.show({
                type: 'info',
                text1: 'Quick response',
                text2: 'Using cached result',
                position: 'top',
                visibilityTime: 2000,
                autoHide: true,
            });
        }

        return data;
    } catch (error: any) {
        Toast.show({
            type: 'error',
            text1: 'Error sending message',
            text2: error.message || 'Please try again later.',
            position: 'top',
            visibilityTime: 3000,
            autoHide: true,
        });
        throw error;
    }
};

export const fetchConversation = async (): Promise<Conversation | null> => {
    try {
        const response = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/recommend/conversation`, {
            method: 'GET'
        });
        const data = await response.json();
        return data.conversation;
    } catch (error: any) {
        // Only show error toast for critical failures
        if (error.response?.status >= 500) {
            Toast.show({
                type: 'error',
                text1: 'Connection error',
                text2: 'Please check your internet connection',
                position: 'top',
                visibilityTime: 3000,
                autoHide: true,
            });
        }
        throw error;
    }
};

export const fetchConversationMessages = async (): Promise<LocalMessage[]> => {
    try {
        const response = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/recommend/conversation`, {
            method: 'GET'
        });
        const data = await response.json()
        const messages = data.conversation.messages;

        return messages.map((msg: any) => ({
            id: msg.id.toString(),
            content: msg.content,
            sender: msg.senderRole === 'USER' ? 'user' : 'ai',
            timestamp: new Date(msg.createdAt)
        }));
    } catch (error: any) {
        // Only show error toast for critical failures
        if (error.response?.status >= 500) {
            Toast.show({
                type: 'error',
                text1: 'Connection error',
                text2: 'Please check your internet connection',
                position: 'top',
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
            method: 'DELETE'
        });

        Toast.show({
            type: 'success',
            text1: 'Conversation cleared',
            position: 'top',
            visibilityTime: 3000,
            autoHide: true,
        });
    } catch (error: any) {
        Toast.show({
            type: 'error',
            text1: 'Failed to clear conversation',
            text2: error.message || 'Please try again.',
            position: 'top',
            visibilityTime: 3000,
            autoHide: true,
        });
        throw error;
    }
};
