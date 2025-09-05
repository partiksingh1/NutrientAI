import { Router } from 'express';
import { recommend } from '../controller/recommendation.controller.js';
// import authMiddleware from '../middlewares/auth.middleware';

const recommend_router = Router();

recommend_router.post('/ai', /* authMiddleware, */ recommend);
export default recommend_router;
