import { Router } from 'express';
import { getProgressAnalytics, getNutritionTrends } from '../controller/analytics.controller.js';
import { authMiddleware } from '../middleware/auth_middleware.js';

const analytics = Router();

// Get user progress analytics
analytics.get('/progress', authMiddleware, getProgressAnalytics);

// Get nutrition trends over time
analytics.get('/trends', authMiddleware, getNutritionTrends);

export default analytics;