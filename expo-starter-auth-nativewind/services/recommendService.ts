import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocalMessage, Conversation } from '@/types/recommend';
import { Toast } from 'toastify-react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const AUTH_TOKEN_KEY = "auth_token";

const getAuthToken = async (): Promise<string | null> => {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
};

export const sendMessageToAI = async (userId: string, message: string): Promise<string> => {
    const token = await getAuthToken();

    try {
        const response = await fetch(`${API_BASE_URL}/recommend/ai`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: JSON.stringify({ userId, message: message.trim() }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get AI response');
        }

        const data = await response.json();

        Toast.show({
            type: 'success',
            text1: 'Message sent',
            text2: 'AI response received successfully',
            position: 'top',
            visibilityTime: 3000,
            autoHide: true,
        });

        return data.reply || 'Sorry, I couldn\'t process your request right now.';
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

export const fetchConversations = async (): Promise<Conversation[]> => {
    const token = await getAuthToken();
    try {
        const response = await axios.get(`${API_BASE_URL}/recommend/conversations`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        Toast.show({
            type: 'success',
            text1: 'Conversations loaded',
            position: 'top',
            visibilityTime: 2000,
            autoHide: true,
        });

        return response.data.conversations;
    } catch (error: any) {
        Toast.show({
            type: 'error',
            text1: 'Failed to load conversations',
            text2: error.message || 'Please try again.',
            position: 'top',
            visibilityTime: 3000,
            autoHide: true,
        });
        throw error;
    }
};

export const fetchConversationMessages = async (conversationId: number): Promise<LocalMessage[]> => {
    const token = await getAuthToken();
    try {
        const response = await axios.get(`${API_BASE_URL}/recommend/conversations/${conversationId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        Toast.show({
            type: 'success',
            text1: 'Messages loaded',
            position: 'top',
            visibilityTime: 2000,
            autoHide: true,
        });

        const messages = response.data.conversation.messages;

        return messages.map((msg: any) => ({
            id: msg.id.toString(),
            content: msg.content,
            sender: msg.senderRole === 'USER' ? 'user' : 'ai',
            timestamp: new Date(msg.createdAt)
        }));
    } catch (error: any) {
        Toast.show({
            type: 'error',
            text1: 'Failed to load messages',
            text2: error.message || 'Please try again.',
            position: 'top',
            visibilityTime: 3000,
            autoHide: true,
        });
        throw error;
    }
};

export const deleteConversationById = async (conversationId: number): Promise<void> => {
    const token = await getAuthToken();
    try {
        await axios.delete(`${API_BASE_URL}/recommend/conversations/${conversationId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        Toast.show({
            type: 'success',
            text1: 'Conversation deleted',
            position: 'top',
            visibilityTime: 3000,
            autoHide: true,
        });
    } catch (error: any) {
        Toast.show({
            type: 'error',
            text1: 'Failed to delete conversation',
            text2: error.message || 'Please try again.',
            position: 'top',
            visibilityTime: 3000,
            autoHide: true,
        });
        throw error;
    }
};
