import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { deleteConversationById, fetchConversationMessages, fetchConversations, sendMessageToAI } from '@/services/recommendService';
import { Conversation, LocalMessage } from '@/types/recommend';

interface UseChatParams {
    userId: string | null;
}

export const useChat = ({ userId }: UseChatParams) => {
    const [messages, setMessages] = useState<LocalMessage[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
    const [showConversations, setShowConversations] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingConversations, setIsLoadingConversations] = useState(false);
    const scrollViewRef = useRef(null);

    // Load all conversations
    const loadConversations = async () => {
        if (!userId) return;
        setIsLoadingConversations(true);
        try {
            const data = await fetchConversations();
            setConversations(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load conversations');
        } finally {
            setIsLoadingConversations(false);
        }
    };

    // Load specific conversation
    const loadConversationMessages = async (conversationId: number) => {
        try {
            const localMessages = await fetchConversationMessages(conversationId);
            setMessages(localMessages);
        } catch (error) {
            Alert.alert('Error', 'Failed to load conversation');
            setMessages([]);
        }
    };

    // Delete a conversation
    const deleteConversation = async (conversationId: number) => {
        try {
            await deleteConversationById(conversationId);
            loadConversations(); // refresh
        } catch (error) {
            Alert.alert('Error', 'Failed to delete conversation');
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
            const aiReply = await sendMessageToAI(userId, currentInput);

            const aiMessage: LocalMessage = {
                id: (Date.now() + 1).toString(),
                content: aiReply,
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

    // Start new conversation
    const startNewConversation = () => {
        setCurrentConversationId(null);
        setShowConversations(false);
        setMessages([{
            id: 'welcome',
            content: "Hi! I'm your AI nutritionist assistant. I can help you log meals, track progress, and give personalized recommendations. What would you like to know today?",
            sender: 'ai',
            timestamp: new Date()
        }]);
    };

    // On mount, load conversations
    useEffect(() => {
        loadConversations();
    }, []);

    // When conversation changes
    useEffect(() => {
        if (currentConversationId) {
            loadConversationMessages(currentConversationId);
        } else {
            startNewConversation();
        }
    }, [currentConversationId]);

    return {
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
    };
};
