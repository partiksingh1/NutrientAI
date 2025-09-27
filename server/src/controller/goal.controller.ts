import type { Request, Response } from 'express';
import prisma from '../db/prisma.js';

export const createGoal = async (req: Request, res: Response) => {
    const userId = Number(req.user?.id);

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    const { type, description, endDate } = req.body;
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
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    const { type, description, endDate, isActive } = req.body;
    try {
        const existingGoal = await prisma.goal.findFirst({
            where: { id: Number(userId) },
        });

        if (!existingGoal || existingGoal.userId !== userId) {
            return res.status(404).json({ error: 'Goal not found or unauthorized' });
        }

        const updatedGoal = await prisma.goal.update({
            where: { id: existingGoal.id },
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

export const updateDailyGoals = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    try {
        const existingGoal = await prisma.goal.findUnique({
            where: { id: Number(id) },
        });

        if (!existingGoal || existingGoal.userId !== userId) {
            return res.status(404).json({ error: 'Goal not found or unauthorized' });
        }
        const { protein, carbs, fats, calories } = req.body;
        const createDailyGoals = await prisma.goal.update({
            where: {
                userId: Number(userId),
                id: Number(id)
            },
            data: {
                protein: protein,
                calories: calories,
                carbs: carbs,
                fats: fats
            }
        })
        if (createDailyGoals) {
            return res.status(200).json({
                message: "Goal is updated successfully"
            })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update goal' });
    }
}
export const getDailyGoals = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    try {
        const existingGoal = await prisma.goal.findFirst({
            where: { userId: Number(userId) },
        });

        if (!existingGoal || existingGoal.userId !== userId) {
            return res.status(404).json({ error: 'Goal not found or unauthorized' });
        }
        const createDailyGoals = await prisma.goal.findFirst({
            where: {
                userId: Number(userId),
            },
            select: {
                protein: true,
                carbs: true,
                fats: true,
                calories: true,
            },
        })
        if (createDailyGoals) {
            return res.status(200).json({
                message: "Goals are fetched successfully",
                createDailyGoals
            })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
}