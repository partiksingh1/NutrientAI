export interface Conversation {
    id: number;
    title: string;
    createdAt: string;
    updatedAt: string;
    messages?: Message[];
}

export interface Message {
    id: number;
    senderRole: 'USER' | 'AI';
    content: string;
    createdAt: string;
    metadata?: any;
}

export interface AIResponse {
    reply: string;
    conversationId: number;
    messageId: number;
    cached: boolean;
}

export interface LocalMessage {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

