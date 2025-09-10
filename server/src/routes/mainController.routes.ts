import { Router } from 'express';
import { mainController } from '../controller/set.controller.js';
import { authMiddleware } from '../middleware/auth_middleware.js';
const main_router = Router();

main_router.post('/', authMiddleware, mainController);

export default main_router;
