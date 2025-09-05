import { Router } from 'express';
import { createGoal, updateGoal } from '../controller/goal.controller.js';
const goal_router = Router();

goal_router.post('/', /* authMiddleware, */ createGoal);
goal_router.put('/:id', /* authMiddleware, */ updateGoal);

export default goal_router;
