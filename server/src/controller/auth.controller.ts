import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma.js';
import { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'superrefreshsecret'; // use separate env var

// Token generation utilities
const generateAccessToken = (userId: number) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (userId: number) => {
    return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });
};

type Signup = {
    username: string;
    email: string;
    password: string;
};

export const signup = async (req: Request, res: Response) => {
    const { username, email, password }: Signup = req.body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });

        const accessToken = generateAccessToken(newUser.id);
        const refreshToken = generateRefreshToken(newUser.id);

        // Save refresh token in DB
        await prisma.user.update({
            where: { id: newUser.id },
            data: { refreshToken },
        });

        return res.status(201).json({
            accessToken,
            refreshToken,
            user: {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
                profile_completed: newUser.profile_completed,
            },
        });
    } catch (error) {
        console.error('Signup Error:', error);
        return res.status(500).json({ error: 'Signup failed' });
    }
};

export const signin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Save refresh token in DB
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });

        return res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                profile_completed: user.profile_completed,
            },
        });
    } catch (error) {
        console.error('Signin Error:', error);
        return res.status(500).json({ error: 'Signin failed' });
    }
};
export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: 'Missing refresh token' });
    }

    try {
        // Verify refresh token
        const payload = jwt.verify(refreshToken, REFRESH_SECRET) as { userId: number };

        const user = await prisma.user.findUnique({ where: { id: payload.userId } });

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        const newAccessToken = generateAccessToken(user.id);
        const newRefreshToken = generateRefreshToken(user.id);

        // Update refresh token in DB (rotation)
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken },
        });

        return res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        console.error('Refresh Token Error:', error);
        return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }
};
export const logout = async (req: Request, res: Response) => {
    const { userId } = req.body;

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });

        return res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout Error:', error)
        return res.status(500).json({ error: 'Logout failed' });
    }
};


export const googleLogin = async (req: Request, res: Response) => {
    console.log("req is", req.body);
    const { token } = req.body;
    console.log("token is", token);

    if (!token) {
        return res.status(400).json({ error: 'Missing Google access token' });
    }

    try {
        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            return res.status(400).json({ error: 'Invalid Google token' });
        }

        const email = payload.email;
        const username = payload.name || email.split('@')[0] as string;

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Create user with a dummy password since it's a Google login
            user = await prisma.user.create({
                data: {
                    email,
                    username,
                    password: '', // optional: mark with isGoogleAccount flag
                },
            });
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });

        return res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                profile_completed: user.profile_completed,
            },
        });

    } catch (error) {
        console.error('Google Sign-In Error:', error);
        return res.status(500).json({ error: 'Google sign-in failed' });
    }
};
