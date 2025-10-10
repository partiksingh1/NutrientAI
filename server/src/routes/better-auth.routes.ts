import { Router } from 'express';
import { auth } from '../auth/better-auth.js';

const router = Router();

// BetterAuth API routes
router.all('/api/auth/*', (req, res) => {
  return auth.handler(req, res);
});

export default router;