import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Extend the Express Request type to include the `user` property
declare module 'express' {
    interface Request {
        user?: { id: Number };
    }
}

interface TokenPayload extends JwtPayload {
    userId: Number;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token as any, JWT_SECRET);

        // Type guard to ensure decoded is a JwtPayload with userId
        if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
            const { userId } = decoded as TokenPayload;

            req.user = { id: userId };
            return next();
        }

        return res.status(401).json({ error: 'Invalid token payload' });
    } catch (err) {
        console.error('JWT verification failed:', err);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
