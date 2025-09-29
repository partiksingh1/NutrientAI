import { Router } from 'express';
import { createPreference, deletePreference, getPreference, updatePreference } from '../controller/preferences.controller.js';
import { authMiddleware } from '../middleware/auth_middleware.js';

// import authMiddleware from '../middlewares/auth.middleware';

const preference = Router();

preference.post('/', authMiddleware, createPreference);
preference.put('/', authMiddleware, updatePreference);
preference.get('/:id', authMiddleware, getPreference);
preference.delete('/:id', authMiddleware, deletePreference);

export default preference;
