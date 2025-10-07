import type { Request, Response } from 'express';
import prisma from '../db/prisma.js';
import type { $Enums } from '../../generated/prisma/index.js';

type DailyTotal = {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    meals: number;
};

type DailyTotals = Record<string, DailyTotal>;

// Get user progress analytics
export const getProgressAnalytics = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { period = 'week' } = req.query;

        // Calculate date range based on period
        const now = new Date();
        let startDate: Date;

        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'quarter':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        // Get user's current weight and goals
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            include: {
                dietaryGoals: {
                    where: { isActive: true },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        // Get meal logs for the period
        const mealLogs = await prisma.mealLog.findMany({
            where: {
                userId: Number(userId),
                mealDate: {
                    gte: startDate,
                    lte: now
                }
            },
            orderBy: { mealDate: 'asc' }
        });

        // Calculate daily nutrition totals
        const dailyTotals: DailyTotals = {};

        mealLogs.forEach(meal => {
            const date = meal.mealDate.toISOString().split('T')[0] as string;
            if (!dailyTotals[date]) {
                dailyTotals[date] = { calories: 0, protein: 0, carbs: 0, fats: 0, meals: 0 };
            }
            dailyTotals[date].calories += meal.calories;
            dailyTotals[date].protein += meal.protein;
            dailyTotals[date].carbs += meal.carbs;
            dailyTotals[date].fats += meal.fats;
            dailyTotals[date].meals += 1;
        });

        // Calculate averages
        const days = Object.keys(dailyTotals).length;
        const avgCalories = days > 0 ? Object.values(dailyTotals).reduce((sum, day) => sum + day.calories, 0) / days : 0;
        const avgProtein = days > 0 ? Object.values(dailyTotals).reduce((sum, day) => sum + day.protein, 0) / days : 0;
        const avgCarbs = days > 0 ? Object.values(dailyTotals).reduce((sum, day) => sum + day.carbs, 0) / days : 0;
        const avgFats = days > 0 ? Object.values(dailyTotals).reduce((sum, day) => sum + day.fats, 0) / days : 0;

        // Calculate adherence (simplified - based on logging consistency)
        const totalDays = Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        const loggedDays = Object.keys(dailyTotals).length;
        const adherence = totalDays > 0 ? Math.round((loggedDays / totalDays) * 100) : 0;

        // Get weight progress (mock data for now since we don't have weight tracking)
        const weightProgress = [
            { date: startDate.toISOString().split('T')[0], weight: user?.weight || 70 },
            { date: now.toISOString().split('T')[0], weight: user?.weight || 70 }
        ];

        // Calculate macro distribution for pie chart
        const totalMacros = avgProtein + avgCarbs + avgFats;
        const macroDistribution = totalMacros > 0 ? [
            {
                value: Math.round((avgProtein / totalMacros) * 100),
                color: '#22c55e',
                label: 'Protein'
            },
            {
                value: Math.round((avgCarbs / totalMacros) * 100),
                color: '#3b82f6',
                label: 'Carbs'
            },
            {
                value: Math.round((avgFats / totalMacros) * 100),
                color: '#f59e0b',
                label: 'Fats'
            }
        ] : [];

        // Calculate achievements
        const achievements = await calculateAchievements(Number(userId), mealLogs, dailyTotals);

        res.json({
            period,
            stats: {
                avgCalories: Math.round(avgCalories),
                avgProtein: Math.round(avgProtein),
                avgCarbs: Math.round(avgCarbs),
                avgFats: Math.round(avgFats),
                adherence,
                totalMeals: mealLogs.length,
                loggedDays
            },
            weightProgress,
            macroDistribution,
            achievements,
            dailyTotals: Object.entries(dailyTotals).map(([date, totals]) => ({
                date,
                ...totals
            }))
        });

    } catch (error) {
        console.error('Error fetching progress analytics:', error);
        res.status(500).json({ error: 'Failed to fetch progress analytics' });
    }
};

// Calculate user achievements
const calculateAchievements = async (userId: number, mealLogs: { id: number; userId: number; protein: number; carbs: number; fats: number; calories: number; createdAt: Date; updatedAt: Date; mealType: $Enums.MealType; customName: string | null; servings: number; notes: string | null; mealDate: Date; }[], dailyTotals: DailyTotals) => {
    const achievements = [];

    // 7-Day Streak
    const consecutiveDays = calculateConsecutiveDays(dailyTotals);
    achievements.push({
        title: '7-Day Streak',
        description: 'Logged meals for 7 days straight!',
        earned: consecutiveDays >= 7,
        progress: Math.min(consecutiveDays, 7)
    });

    // Protein Pro
    const proteinDays = Object.values(dailyTotals).filter(day => day.protein >= 100).length;
    achievements.push({
        title: 'Protein Pro',
        description: 'Hit protein goals 5 days this week',
        earned: proteinDays >= 5,
        progress: Math.min(proteinDays, 5)
    });

    // Consistent Logger
    const totalDays = Object.keys(dailyTotals).length;
    achievements.push({
        title: 'Consistent Logger',
        description: 'Log meals consistently',
        earned: totalDays >= 10,
        progress: Math.min(totalDays, 10)
    });

    // Macro Master
    const balancedDays = Object.values(dailyTotals).filter(day => {
        const total = day.protein + day.carbs + day.fats;
        if (total === 0) return false;
        const proteinPct = (day.protein / total) * 100;
        const carbPct = (day.carbs / total) * 100;
        const fatPct = (day.fats / total) * 100;
        return proteinPct >= 20 && proteinPct <= 40 &&
            carbPct >= 30 && carbPct <= 60 &&
            fatPct >= 15 && fatPct <= 35;
    }).length;

    achievements.push({
        title: 'Macro Master',
        description: 'Maintained balanced macros',
        earned: balancedDays >= 5,
        progress: Math.min(balancedDays, 5)
    });

    return achievements;
};

// Calculate consecutive days with meal logs
const calculateConsecutiveDays = (dailyTotals: DailyTotals) => {
    const dates = Object.keys(dailyTotals).sort();
    let maxStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const dateStr of dates) {
        const currentDate = new Date(dateStr);

        if (lastDate) {
            const dayDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000));
            if (dayDiff === 1) {
                currentStreak++;
            } else {
                maxStreak = Math.max(maxStreak, currentStreak);
                currentStreak = 1;
            }
        } else {
            currentStreak = 1;
        }

        lastDate = currentDate;
    }

    return Math.max(maxStreak, currentStreak);
};

// Get nutrition trends over time
export const getNutritionTrends = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { period = 'week' } = req.query;

        // Calculate date range
        const now = new Date();
        let startDate: Date;

        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'quarter':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        // Get meal logs grouped by date
        const mealLogs = await prisma.mealLog.findMany({
            where: {
                userId: Number(userId),
                mealDate: {
                    gte: startDate,
                    lte: now
                }
            },
            orderBy: { mealDate: 'asc' }
        });

        // Group by date and calculate daily totals
        const dailyData: Record<string, { calories: number; protein: number; carbs: number; fats: number }> = {};

        mealLogs.forEach(meal => {
            const date = meal.mealDate.toISOString().split('T')[0] as string;
            if (!dailyData[date]) {
                dailyData[date] = { calories: 0, protein: 0, carbs: 0, fats: 0 };
            }
            dailyData[date].calories += meal.calories;
            dailyData[date].protein += meal.protein;
            dailyData[date].carbs += meal.carbs;
            dailyData[date].fats += meal.fats;
        });

        // Convert to array format for charts
        const trends = Object.entries(dailyData).map(([date, totals]) => ({
            date,
            ...totals
        }));

        res.json({ trends });

    } catch (error) {
        console.error('Error fetching nutrition trends:', error);
        res.status(500).json({ error: 'Failed to fetch nutrition trends' });
    }
};