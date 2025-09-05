import type { Request, Response } from 'express';
import prisma from '../db/prisma.js';


export const createPreference = async (req: Request, res: Response) => {
    //   const userId = req.userId;
    //   if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { userId, mealFrequency, snackIncluded, dietType, allergies } = req.body;

    try {
        // Check if preference already exists for user (userId is unique)
        const existing = await prisma.preferences.findUnique({ where: { userId } });
        if (existing) {
            return res.status(400).json({ error: 'Preferences already exist for this user' });
        }

        const preference = await prisma.preferences.create({
            data: {
                userId,
                mealFrequency,
                snackIncluded,
                dietType,
                allergies,
            },
        });

        res.status(201).json(preference);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create preferences' });
    }
};

export const updatePreference = async (req: Request, res: Response) => {
    //   const userId = req.userId;
    //   if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id, userId, mealFrequency, snackIncluded, dietType, allergies } = req.body;

    try {
        const existing = await prisma.preferences.findUnique(
            { where: { userId: userId, id: id } }
        );
        if (!existing) {
            return res.status(404).json({ error: 'Preferences not found for this user' });
        }

        const updated = await prisma.preferences.update({
            where: { userId },
            data: {
                mealFrequency,
                snackIncluded,
                dietType,
                allergies,
                updatedAt: new Date(),
            },
        });

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
};

export const getPreference = async (req: Request, res: Response) => {
    //   const userId = req.userId;
    //   if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const id = Number(req.params.id)
    try {
        const preference = await prisma.preferences.findUnique({ where: { userId: id } });
        if (!preference) {
            return res.status(404).json({ error: 'Preferences not found' });
        }
        res.json(preference);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get preferences' });
    }
};

export const deletePreference = async (req: Request, res: Response) => {
    //   const userId = req.userId;
    //   if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const id = Number(req.params.id)

    try {
        const existing = await prisma.preferences.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: 'Preferences not found' });
        }

        await prisma.preferences.delete({ where: { id } });
        res.json({ message: 'Preferences deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete preferences' });
    }
};
