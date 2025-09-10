import { Router } from 'express';
import {
    getNutritionalOverview,
    getMealTypeAnalysis,
    getGoalProgress
} from '../controller/analytics.controller.js';

const analytics = Router();

// Get nutritional overview for a specific period
analytics.get('/overview/:userId', getNutritionalOverview);

// Get detailed analytics with trends
// analytics.get('/detailed/:userId', getDetailedAnalytics);

// Get meal type analysis
analytics.get('/meal-types/:userId', getMealTypeAnalysis);

// Get goal progress
analytics.get('/progress/:userId', getGoalProgress);

export default analytics;