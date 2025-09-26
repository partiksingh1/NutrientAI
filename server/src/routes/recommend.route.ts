import { Router } from 'express';
import {
    recommend,
    getConversations,
    getConversationMessages,
    deleteConversation
} from '../controller/recommendation.controller.js';
import { authMiddleware } from '../middleware/auth_middleware.js';

const recommend_router = Router();

// AI Recommendation endpoint
recommend_router.post('/ai', authMiddleware, recommend);

// Conversation management endpoints
recommend_router.get('/conversations', authMiddleware, getConversations);
recommend_router.get('/conversations/:conversationId', authMiddleware, getConversationMessages);
recommend_router.delete('/conversations/:conversationId', authMiddleware, deleteConversation);

export default recommend_router;
