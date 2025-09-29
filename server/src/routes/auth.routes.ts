import { Router } from 'express';
import { refreshToken, signin, signup } from '../controller/auth.controller.js';


const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/refresh', refreshToken);

export default router;
