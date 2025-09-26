import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { clearConversation, fetchConversationMessages, sendMessageToAI } from '@/services/recommendService';
import { LocalMessage } from '@/types/recommend';

interface UseChatParams {
    userId: string | null;
}

export const useChat = ({ userId }: UseChatParams) => {
    const [messages, setMessages] = useState<LocalMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const scrollViewRef = useRef(null);

    // Load conversation messages
    const loadConversationMessages = async () => {
        if (!userId) return;
        setIsLoadingMessages(true);
        try {
            const localMessages = await fetchConversationMessages();
            setMessages(localMessages);
        } catch (error) {
            Alert.alert('Error', 'Failed to load conversation');
            setMessages([]);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    // Clear conversation
    const clearConversationMessages = async () => {
        try {
            await clearConversation();
            setMessages([]);
        } catch (error) {
            Alert.alert('Error', 'Failed to clear conversation');
        }
    };

    // Send a message to AI
    const handleSend = async () => {
        if (!inputValue.trim() || !userId || isLoading) return;

        const userMessage: LocalMessage = {
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
            const aiResponse = await sendMessageToAI(userId, currentInput);

            const aiMessage: LocalMessage = {
                id: (aiResponse.messageId ? aiResponse.messageId.toString() : (Date.now() + 1).toString()),
                content: aiResponse.reply,
                sender: 'ai',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            setMessages(prev => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    content: 'Sorry, I\'m having trouble connecting right now. Please check your internet connection and try again.',
                    sender: 'ai',
                    timestamp: new Date()
                }
            ]);

            if (__DEV__) {
                Alert.alert('API Error', `Failed to get AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        } finally {
            setIsTyping(false);
            setIsLoading(false);
        }
    };

    // On mount, load conversation messages
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
