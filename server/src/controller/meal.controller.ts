import type { Request, Response } from 'express';
import prisma from '../db/prisma.js';
import { generateFollowUpQuestion, loadPartial, mergePartial, parseMealText, validateParsedData } from '../langchain/mealChain.js';
import { Prisma } from '../../generated/prisma/index.js';

// Main API handler
export const aiMealLogger = async (req: Request, res: Response) => {
    // Validate user authentication (pseudo-code, replace with actual auth)
    const userId = req.body.userId;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized: Invalid user ID" });
    }

    // Validate input message
    const userText: string = req.body.message;
    if (!userText || typeof userText !== "string") {
        return res.status(400).json({ error: "Message required" });
    }

    try {
        // 1) Parse new user text
        const parsed = await parseMealText(userText);

        // 3) Validate parsed data
        const validationIssues = validateParsedData(parsed);
        console.log("validationIssues :", validationIssues);
        console.log("validationIssues length:", validationIssues.length);

        // const missing = requiredFieldsMissing(merged);

        // 4) Generate follow-up question if needed
        if (validationIssues.length > 0) {
            const question = await generateFollowUpQuestion(parsed, validationIssues);
            return res.json({ status: "need_more", question, partial: parsed });
        }

        // 5) Validate required fields for saving
        // if (!merged.mealType || !merged.customName || !merged.calories) {
        //     return res.status(400).json({ error: "Missing required fields: mealType, customName, or calories" });
        // }

        // 6) Save to database
        const finalData: Prisma.MealLogUncheckedCreateInput = {
            userId, // 👈 raw foreign key
            mealType: parsed.mealType?.toUpperCase() as any,
            customName: parsed.customName ?? null,
            calories: parsed.calories!,
            protein: parsed.protein!,
            carbs: parsed.carbs!,
            fats: parsed.fats!,
            servings: parsed.servings ?? 1,
            mealDate: parsed.mealDate ? new Date(parsed.mealDate) : new Date(),
        };

        // const newMealLog = await prisma.mealLog.create({ data: finalData });
        return res.status(201).json(finalData);
    } catch (err) {
        console.error(`Failed to process meal log for user ${userId}:`, err);
        return res.status(500).json({ error: "Failed to process meal log" });
    }
};

export const createMealLog = async (req: Request, res: Response) => {
    //   const userId = req.userId;
    //   if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { userId, mealType, customName, calories, protein, carbs, fats, servings, mealDate } = req.body;

    try {
        const newMealLog = await prisma.mealLog.create({
            data: {
                userId,
                mealType,
                customName,
                calories,
                protein,
                carbs,
                fats,
                servings: servings ?? 1.0,
                mealDate: new Date(mealDate),
            },
        });

        res.status(201).json(newMealLog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create meal log' });
    }
};

export const updateMealLog = async (req: Request, res: Response) => {
    //   const userId = req.userId;
    //   if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const id = Number(req.params.id);
    const { userId, mealType, customName, calories, protein, carbs, fats, servings, mealDate } = req.body;

    try {
        const existingMealLog = await prisma.mealLog.findUnique({ where: { id } });

        if (!existingMealLog || existingMealLog.userId !== userId) {
            return res.status(404).json({ error: 'Meal log not found or unauthorized' });
        }

        const updateData: any = {
            mealType,
            customName,
            calories,
            protein,
            carbs,
            fats,
            servings,
        };

        if (mealDate) {
            updateData.mealDate = new Date(mealDate);
        }

        const updatedMealLog = await prisma.mealLog.update({
            where: { id: id },
            data: updateData,
        });


        res.json(updatedMealLog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update meal log' });
    }
};

export const getAllMealLogs = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!id) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const mealLogs = await prisma.mealLog.findMany({
            where: {
                userId: id
            },
            orderBy: { mealDate: 'desc' },
        });

        res.json(mealLogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch meal logs' });
    }
};

export const deleteMealLog = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!id) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const existingMealLog = await prisma.mealLog.findUnique({ where: { id } });

        if (!existingMealLog || existingMealLog.userId !== id) {
            return res.status(404).json({ error: 'Meal log not found or unauthorized' });
        }

        await prisma.mealLog.delete({ where: { id } });

        res.json({ message: 'Meal log deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete meal log' });
    }
};
