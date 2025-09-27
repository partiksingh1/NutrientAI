import { Router } from 'express';
import { getUserProfile, updateUserProfile, updateUserPreferences, deleteUserAccount } from '../controller/user.controller.js';
import { authMiddleware } from '../middleware/auth_middleware.js';

const router = Router();

// Get user profile
router.get('/profile', authMiddleware, getUserProfile);

// Update user profile
router.put('/profile', authMiddleware, updateUserProfile);

// Update user preferences
router.put('/preferences', authMiddleware, updateUserPreferences);

// Delete user account
router.delete('/account', authMiddleware, deleteUserAccount);

export default router;
