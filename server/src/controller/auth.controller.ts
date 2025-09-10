import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

type Signup = {
    username: string,
    email: string,
    password: string
}

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
                password: hashedPassword
            },
        });

        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '1d' });

        return res.status(201).json({ token, user: { id: newUser.id, email: newUser.email, username: newUser.username, profile_completed: newUser.profile_completed } });
    } catch (error) {
        console.error("Signup Error:", error);
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

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

        return res.json({ token, user: { id: user.id, email: user.email, username: user.username, profile_completed: user.profile_completed } });
    } catch (error) {
        return res.status(500).json({ error: 'Signin failed' });
    }
};
