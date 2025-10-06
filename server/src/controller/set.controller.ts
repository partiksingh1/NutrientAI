import type { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../db/prisma.js';

// Zod schema for the request body
const CompleteProfileSchema = z.object({
    height: z.number().positive(),
    weight: z.number().positive(),
    age: z.number().int().positive(),
    gender: z.string(),
    activityLevel: z.string(),
    mealFrequency: z.number().int().min(1).max(10),
    snackIncluded: z.boolean(),
    dietType: z.enum([
        'OMNIVORE',
        'VEGETARIAN',
        'VEGAN',
        'KETO',
        'PALEO',
        'GLUTEN_FREE',
        'OTHER',
    ]),
    allergies: z.string(),

    dietaryGoals: z
        .array(
            z.object({
                type: z.enum([
                    'MUSCLE_GAIN',
                    'FAT_LOSS',
                    'MAINTENANCE',
                    'RECOMP',
                    'GENERAL_HEALTH',
                ]),
                description: z.string().optional(),
                endDate: z.coerce.date().optional(),
            })
        )
});

export const mainController = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    try {
        // ✅ Validate input using Zod
        const parsedData = CompleteProfileSchema.parse(req.body);

        const {
            height,
            weight,
            age,
            gender,
            activityLevel,
            dietaryGoals,
            mealFrequency,
            snackIncluded,
            dietType,
            allergies,
        } = parsedData;

        // ✅ Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: Number(userId) },
        });

        if (!existingUser) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // ✅ Update user
        await prisma.user.update({
            where: { id: Number(userId) },
            data: {
                height,
                weight,
                gender,
                age,
                profile_completed: true,
                activityLevel,
            },
        });

        // ✅ Upsert Preferences
        await prisma.preferences.upsert({
            where: { userId: Number(userId) },
            update: {
                mealFrequency,
                snackIncluded,
                dietType,
                allergies,
            },
            create: {
                userId: Number(userId),
                mealFrequency: mealFrequency ?? 3,
                snackIncluded: snackIncluded ?? true,
                dietType: dietType ?? 'OMNIVORE',
                allergies: allergies ?? null,
            },
        });

        // ✅ Handle Goals
        if (dietaryGoals?.length) {
            await prisma.goal.deleteMany({
                where: { userId: Number(userId) },
            });

            await prisma.goal.createMany({
                data: dietaryGoals.map(goal => ({
                    userId: Number(userId),
                    type: goal.type,
                    description: goal.description ?? null,
                    endDate: goal.endDate ?? null,
                })),
            });
        }

        return res.status(200).json({
            message: 'User profile completed successfully',
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error,
            });
        }

        console.error('Error in mainController:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
