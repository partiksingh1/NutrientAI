import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useChat } from "../hooks/useChat";
import * as api from '@/services/recommendService';
jest.mock('@/services/recommendService');

const mockConversations = [
    { id: 1, title: 'Test Conversation', updatedAt: new Date().toISOString(), messages: [] }
];

const mockMessages = [
    {
        id: '1',
        content: 'Hello AI',
        sender: 'user',
        timestamp: new Date()
    },
    {
        id: '2',
        content: 'Hi user!',
        sender: 'ai',
        timestamp: new Date()
    }
];

describe('useChat', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('loads conversations on mount', async () => {
        (api.fetchConversations as jest.Mock).mockResolvedValue(mockConversations);

        const { result } = renderHook(() => useChat({ userId: '123' }));

        await waitFor(() => {
            expect(result.current.conversations.length).toBeGreaterThan(0);
        });

        expect(api.fetchConversations).toHaveBeenCalledTimes(1);
    });


    test('starts new conversation with welcome message', async () => {
        (api.fetchConversations as jest.Mock).mockResolvedValue([]);

        const { result } = renderHook(() => useChat({ userId: '123' }));

        await waitFor(() => {
            expect(result.current.conversations.length).toBe(0);
        });

        act(() => {
            result.current.startNewConversation();
        });

        expect(result.current.messages[0].sender).toBe('ai');
        expect(result.current.messages[0].content).toMatch(/I'm your AI nutritionist assistant/);
    });


    test('loads messages for an existing conversation', async () => {
        (api.fetchConversations as jest.Mock).mockResolvedValue(mockConversations);
        (api.fetchConversationMessages as jest.Mock).mockResolvedValue(mockMessages);

        const { result } = renderHook(() => useChat({ userId: '123' }));

        await waitFor(() => {
            expect(result.current.conversations.length).toBeGreaterThan(0);
        });

        act(() => {
            result.current.setCurrentConversationId(1);
        });

        await waitFor(() => {
            expect(result.current.messages.length).toBe(2);
        });

        expect(api.fetchConversationMessages).toHaveBeenCalledWith(1);
    });


    test('sends a message and receives AI reply', async () => {
        (api.sendMessageToAI as jest.Mock).mockResolvedValue('This is a reply');

        const { result } = renderHook(() => useChat({ userId: '123' }));

        act(() => {
            result.current.setInputValue('What should I eat?');
        });

        await act(async () => {
            await result.current.handleSend();
        });

        expect(api.sendMessageToAI).toHaveBeenCalledWith('123', 'What should I eat?');

        await waitFor(() => {
            // Check that at least one AI message has the expected reply
            const aiMessages = result.current.messages.filter(m => m.sender === 'ai');
            expect(aiMessages.some(m => m.content === 'This is a reply')).toBe(true);
        });
    });

    test('deletes a conversation and reloads', async () => {
        (api.fetchConversations as jest.Mock).mockResolvedValue(mockConversations);
        (api.deleteConversationById as jest.Mock).mockResolvedValue(undefined);

        const { result } = renderHook(() => useChat({ userId: '123' }));

        await waitFor(() => {
            expect(result.current.conversations.length).toBeGreaterThan(0);
        });

        await act(async () => {
            await result.current.deleteConversation(1);
        });

        expect(api.deleteConversationById).toHaveBeenCalledWith(1);
        expect(api.fetchConversations).toHaveBeenCalledTimes(2); // on mount + after delete
    });


    test('handles error gracefully', async () => {
        (api.fetchConversations as jest.Mock).mockRejectedValue(new Error('Network Error'));

        const { result } = renderHook(() => useChat({ userId: '123' }));

        await waitFor(() => {
            expect(result.current.conversations.length).toBe(0);
        });
    });

});
