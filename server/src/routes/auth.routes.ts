import { Router } from 'express';
import { forgotPassword, googleLogin, refreshToken, resetPassword, signin, signup } from '../controller/auth.controller.js';


const router = Router();

router.post('/signup', signup);
router.post('/google', googleLogin);
router.post('/signin', signin);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
