import { Router } from 'express';
import { aiMealLogger, createMealLog, deleteMealLog, getAllMealLogs, updateMealLog } from '../controller/meal.controller.js';
// import authMiddleware from '../middlewares/auth.middleware';

const meal_logs = Router();

meal_logs.post('/', /* authMiddleware, */ createMealLog);
meal_logs.post('/ai', /* authMiddleware, */ aiMealLogger);
meal_logs.put('/:id', /* authMiddleware, */ updateMealLog);
meal_logs.get('/:id', /* authMiddleware, */ getAllMealLogs);
meal_logs.delete('/:id', /* authMiddleware, */ deleteMealLog);

export default meal_logs;
