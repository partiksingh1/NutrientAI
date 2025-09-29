import { Router } from 'express';
import { createGoal, getDailyGoals, updateDailyGoals, updateGoal } from '../controller/goal.controller.js';
import { authMiddleware } from '../middleware/auth_middleware.js';
const goal_router = Router();

goal_router.post('/', authMiddleware, createGoal);
goal_router.put('/:id', authMiddleware, updateGoal);
goal_router.put('/dailyGoals', authMiddleware, updateDailyGoals)
goal_router.get('/dailyGoals', authMiddleware, getDailyGoals)

export default goal_router;
