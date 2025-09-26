import { Router } from 'express';
import {
    recommend,
    getConversationMessages,
    clearConversation
} from '../controller/recommendation.controller.js';
import { authMiddleware } from '../middleware/auth_middleware.js';

const recommend_router = Router();

// AI Recommendation endpoint
recommend_router.post('/ai', authMiddleware, recommend);

// Single conversation management endpoints
recommend_router.get('/conversation', authMiddleware, getConversationMessages);
recommend_router.delete('/conversation', authMiddleware, clearConversation);

export default recommend_router;
