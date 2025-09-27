import type { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../db/prisma.js';

// Zod schema for updating user profile
const UpdateProfileSchema = z.object({
    username: z.string().min(1).optional(),
    weight: z.number().positive().optional(),
    height: z.number().positive().optional(),
    age: z.number().int().positive().optional(),
    gender: z.string().optional(),
    activityLevel: z.string().optional(),
});

// Zod schema for updating preferences
const UpdatePreferencesSchema = z.object({
    mealFrequency: z.number().int().min(1).max(10).optional(),
    snackIncluded: z.boolean().optional(),
    dietType: z.enum([
        'OMNIVORE',
        'VEGETARIAN',
        'VEGAN',
        'KETO',
        'PALEO',
        'GLUTEN_FREE',
        'OTHER',
    ]).optional(),
    allergies: z.string().optional(),
});

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            include: {
                preferences: true,
                dietaryGoals: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        type: true,
                        description: true,
                        startDate: true,
                        endDate: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove sensitive data
        const { password, ...userProfile } = user;

        return res.json({
            user: userProfile,
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const parsedData = UpdateProfileSchema.parse(req.body);
        const { username, weight, height, age, gender, activityLevel } = parsedData;

        // Check if username is being updated and if it's already taken
        if (username) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    username,
                    id: { not: Number(userId) },
                },
            });

            if (existingUser) {
                return res.status(400).json({ error: 'Username already taken' });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: Number(userId) },
            data: {
                ...(username && { username }),
                ...(weight && { weight }),
                ...(height && { height }),
                ...(age && { age }),
                ...(activityLevel && { activityLevel }),
            },
            include: {
                preferences: true,
                dietaryGoals: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        type: true,
                        description: true,
                        startDate: true,
                        endDate: true,
                    },
                },
            },
        });

        // Remove sensitive data
        const { password, ...userProfile } = updatedUser;

        return res.json({
            message: 'Profile updated successfully',
            user: userProfile,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid input data', details: error.errors });
        }
        console.error('Update user profile error:', error);
        return res.status(500).json({ error: 'Failed to update profile' });
    }
};

// Update user preferences
export const updateUserPreferences = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const parsedData = UpdatePreferencesSchema.parse(req.body);
        const { mealFrequency, snackIncluded, dietType, allergies } = parsedData;

        const preferences = await prisma.preferences.upsert({
            where: { userId: Number(userId) },
            update: {
                ...(mealFrequency && { mealFrequency }),
                ...(snackIncluded !== undefined && { snackIncluded }),
                ...(dietType && { dietType }),
                ...(allergies !== undefined && { allergies }),
            },
            create: {
                userId: Number(userId),
                mealFrequency: mealFrequency ?? 3,
                snackIncluded: snackIncluded ?? true,
                dietType: dietType ?? 'OMNIVORE',
                allergies: allergies ?? null,
            },
        });

        return res.json({
            message: 'Preferences updated successfully',
            preferences,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid input data', details: error.errors });
        }
        console.error('Update preferences error:', error);
        return res.status(500).json({ error: 'Failed to update preferences' });
    }
};

// Delete user account
export const deleteUserAccount = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Delete user and all related data (cascade delete)
        await prisma.user.delete({
            where: { id: Number(userId) },
        });

        return res.json({
            message: 'Account deleted successfully',
        });
    } catch (error) {
        console.error('Delete user account error:', error);
        return res.status(500).json({ error: 'Failed to delete account' });
    }
};
