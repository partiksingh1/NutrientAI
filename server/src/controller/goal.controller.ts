import type { Request, Response } from 'express';
import prisma from '../db/prisma.js';

export const createGoal = async (req: Request, res: Response) => {
    const { type, description, endDate, userId } = req.body;
    //   const userId = req.userId;

    // if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const newGoal = await prisma.goal.create({
            data: {
                userId,
                type,
                description,
                endDate: endDate ? new Date(endDate) : null,
            },
        });

        res.status(201).json(newGoal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create goal' });
    }
};

export const updateGoal = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { type, description, endDate, isActive, userId } = req.body;
    // const userId = req.userId;

    // if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const existingGoal = await prisma.goal.findUnique({
            where: { id: Number(id) },
        });

        if (!existingGoal || existingGoal.userId !== userId) {
            return res.status(404).json({ error: 'Goal not found or unauthorized' });
        }

        const updatedGoal = await prisma.goal.update({
            where: { id: Number(id) },
            data: {
                type,
                description,
                endDate: endDate ? new Date(endDate) : null,
                isActive,
                updatedAt: new Date(),
            },
        });

        res.json(updatedGoal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update goal' });
    }
};
