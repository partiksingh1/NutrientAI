import type { Request, Response } from 'express';
import prisma from '../db/prisma.js';

// Helper function to calculate date ranges
const getDateRange = (period: string) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (period) {
        case 'today':
            return {
                start: startOfDay,
                end: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
            };
        case 'week': {
            const startOfWeek = new Date(startOfDay);
            // Adjust to start of week (Sunday)
            startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
            return {
                start: startOfWeek,
                end: now,
            };
        }
        case 'month': {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return {
                start: startOfMonth,
                end: now,
            };
        }
        case 'year': {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            return {
                start: startOfYear,
                end: now,
            };
        }
        default:
            return {
                start: startOfDay,
                end: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
            };
    }
};

// Get nutritional overview for a user
export const getNutritionalOverview = async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    const period = (req.query.period as string) || 'today';

    if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
        const { start, end } = getDateRange(period);

        const mealLogs = await prisma.mealLog.findMany({
            where: {
                userId,
                mealDate: {
                    gte: start,
                    lt: end,
                },
            },
            orderBy: { mealDate: 'desc' },
        });

        // Calculate totals
        const totals = mealLogs.reduce(
            (acc, meal) => ({
                calories: acc.calories + meal.calories * meal.servings,
                protein: acc.protein + meal.protein * meal.servings,
                carbs: acc.carbs + meal.carbs * meal.servings,
                fats: acc.fats + meal.fats * meal.servings,
                meals: acc.meals + 1,
            }),
            { calories: 0, protein: 0, carbs: 0, fats: 0, meals: 0 }
        );

        // Calculate macronutrient percentages
        const totalMacros = totals.protein * 4 + totals.carbs * 4 + totals.fats * 9;
        const macroPercentages = {
            protein: totalMacros > 0 ? ((totals.protein * 4) / totalMacros) * 100 : 0,
            carbs: totalMacros > 0 ? ((totals.carbs * 4) / totalMacros) * 100 : 0,
            fats: totalMacros > 0 ? ((totals.fats * 9) / totalMacros) * 100 : 0,
        };

        res.json({
            period,
            dateRange: { start, end },
            totals,
            macroPercentages,
            averagePerMeal: {
                calories: totals.meals > 0 ? totals.calories / totals.meals : 0,
                protein: totals.meals > 0 ? totals.protein / totals.meals : 0,
                carbs: totals.meals > 0 ? totals.carbs / totals.meals : 0,
                fats: totals.meals > 0 ? totals.fats / totals.meals : 0,
            },
        });
    } catch (error) {
        console.error('Error fetching nutritional overview:', error);
        res.status(500).json({ error: 'Failed to fetch nutritional overview' });
    }
};

// Get detailed analytics with trends
// export const getDetailedAnalytics = async (req: Request, res: Response) => {
//     const userId = Number(req.params.userId);
//     const days = Number(req.query.days) || 30;

//     if (!userId || isNaN(userId)) {
//         return res.status(400).json({ error: 'Invalid user ID' });
//     }

//     try {
//         const endDate = new Date();
//         const startDate = new Date();
//         startDate.setDate(endDate.getDate() - days);

//         const mealLogs = await prisma.mealLog.findMany({
//             where: {
//                 userId,
//                 mealDate: {
//                     gte: startDate,
//                     lte: endDate,
//                 },
//             },
//             orderBy: { mealDate: 'asc' },
//         });

//         // Group by date
//         const dailyData = mealLogs.reduce((acc, meal) => {
//             const date = meal.mealDate.toISOString().split('T')[0]!; // assert non-null

//             if (!acc[date]) {
//                 acc[date] = { calories: 0, protein: 0, carbs: 0, fats: 0, meals: 0 };
//             }

//             acc[date].calories += meal.calories * meal.servings;
//             acc[date].protein += meal.protein * meal.servings;
//             acc[date].carbs += meal.carbs * meal.servings;
//             acc[date].fats += meal.fats * meal.servings;
//             acc[date].meals += 1;

//             return acc;
//         }, {} as Record<string, { calories: number; protein: number; carbs: number; fats: number; meals: number }>);

//         // Convert to array for frontend consumption
//         const dailyAnalytics = Object.entries(dailyData).map(([date, data]) => ({
//             date,
//             ...data,
//         }));

//         // Calculate averages
//         const totalDays = dailyAnalytics.length;
//         const averages = dailyAnalytics.reduce(
//             (acc, day) => ({
//                 calories: acc.calories + day.calories,
//                 protein: acc.protein + day.protein,
//                 carbs: acc.carbs + day.carbs,
//                 fats: acc.fats + day.fats,
//             }),
//             { calories: 0, protein: 0, carbs: 0, fats: 0 }
//         );

//         Object.keys(averages).forEach((key) => {
//             averages[key as keyof typeof averages] = totalDays > 0 ? averages[key as keyof typeof averages] / totalDays : 0;
//         });

//         res.json({
//             period: `${days} days`,
//             dailyAnalytics,
//             averages,
//             totalDays,
//             trends: calculateTrends(dailyAnalytics),
//         });
//     } catch (error) {
//         console.error('Error fetching detailed analytics:', error);
//         res.status(500).json({ error: 'Failed to fetch detailed analytics' });
//     }
// };

// Helper function to calculate trends
const calculateTrends = (dailyData: any[]) => {
    if (dailyData.length < 14) return null; // Need at least 14 days for comparison

    const recent = dailyData.slice(-7); // Last 7 days
    const previous = dailyData.slice(-14, -7); // Previous 7 days

    const recentAvg = recent.reduce(
        (acc, day) => ({
            calories: acc.calories + day.calories,
            protein: acc.protein + day.protein,
            carbs: acc.carbs + day.carbs,
            fats: acc.fats + day.fats,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    const previousAvg = previous.reduce(
        (acc, day) => ({
            calories: acc.calories + day.calories,
            protein: acc.protein + day.protein,
            carbs: acc.carbs + day.carbs,
            fats: acc.fats + day.fats,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    Object.keys(recentAvg).forEach((key) => {
        recentAvg[key as keyof typeof recentAvg] /= recent.length;
        previousAvg[key as keyof typeof previousAvg] /= previous.length;
    });

    return {
        calories:
            previousAvg.calories > 0 ? ((recentAvg.calories - previousAvg.calories) / previousAvg.calories) * 100 : 0,
        protein: previousAvg.protein > 0 ? ((recentAvg.protein - previousAvg.protein) / previousAvg.protein) * 100 : 0,
        carbs: previousAvg.carbs > 0 ? ((recentAvg.carbs - previousAvg.carbs) / previousAvg.carbs) * 100 : 0,
        fats: previousAvg.fats > 0 ? ((recentAvg.fats - previousAvg.fats) / previousAvg.fats) * 100 : 0,
    };
};

// Get meal type analysis
export const getMealTypeAnalysis = async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    const period = (req.query.period as string) || 'week';

    if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
        const { start, end } = getDateRange(period);

        const mealLogs = await prisma.mealLog.findMany({
            where: {
                userId,
                mealDate: {
                    gte: start,
                    lt: end,
                },
            },
        });

        const mealTypeData = mealLogs.reduce((acc, meal) => {
            const type = meal.mealType;
            if (!acc[type]) {
                acc[type] = {
                    count: 0,
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fats: 0,
                };
            }

            acc[type].count += 1;
            acc[type].calories += meal.calories * meal.servings;
            acc[type].protein += meal.protein * meal.servings;
            acc[type].carbs += meal.carbs * meal.servings;
            acc[type].fats += meal.fats * meal.servings;

            return acc;
        }, {} as Record<string, { count: number; calories: number; protein: number; carbs: number; fats: number }>);

        res.json({
            period,
            mealTypeBreakdown: mealTypeData,
        });
    } catch (error) {
        console.error('Error fetching meal type analysis:', error);
        res.status(500).json({ error: 'Failed to fetch meal type analysis' });
    }
};

// Get goal progress analysis
export const getGoalProgress = async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);

    if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
        // Get user's active goals
        const activeGoals = await prisma.goal.findMany({
            where: {
                userId,
                isActive: true,
            },
        });

        // Get user data for calculations
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { preferences: true },
        });

        if (!user) {
            return res.status(404).json({ error: 'User  not found' });
        }

        // Calculate recommended daily intake based on goals
        const recommendations = calculateDailyRecommendations(user, activeGoals);

        // Get today's intake
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

        const todaysMeals = await prisma.mealLog.findMany({
            where: {
                userId,
                mealDate: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
            },
        });

        const todaysIntake = todaysMeals.reduce(
            (acc, meal) => ({
                calories: acc.calories + meal.calories * meal.servings,
                protein: acc.protein + meal.protein * meal.servings,
                carbs: acc.carbs + meal.carbs * meal.servings,
                fats: acc.fats + meal.fats * meal.servings,
            }),
            { calories: 0, protein: 0, carbs: 0, fats: 0 }
        );

        // Calculate progress percentages
        const progress = {
            calories: recommendations.calories > 0 ? (todaysIntake.calories / recommendations.calories) * 100 : 0,
            protein: recommendations.protein > 0 ? (todaysIntake.protein / recommendations.protein) * 100 : 0,
            carbs: recommendations.carbs > 0 ? (todaysIntake.carbs / recommendations.carbs) * 100 : 0,
            fats: recommendations.fats > 0 ? (todaysIntake.fats / recommendations.fats) * 100 : 0,
        };

        res.json({
            activeGoals,
            recommendations,
            todaysIntake,
            progress,
            remaining: {
                calories: Math.max(0, recommendations.calories - todaysIntake.calories),
                protein: Math.max(0, recommendations.protein - todaysIntake.protein),
                carbs: Math.max(0, recommendations.carbs - todaysIntake.carbs),
                fats: Math.max(0, recommendations.fats - todaysIntake.fats),
            },
        });
    } catch (error) {
        console.error('Error fetching goal progress:', error);
        res.status(500).json({ error: 'Failed to fetch goal progress' });
    }
};

// Helper function to calculate daily recommendations
const calculateDailyRecommendations = (user: any, goals: any[]) => {
    if (!user.weight || !user.height || !user.age) {
        throw new Error('User  weight, height, and age are required for calculations');
    }

    // Basic BMR calculation (Mifflin-St Jeor Equation)
    const bmr =
        user.gender === 'MALE'
            ? 10 * user.weight + 6.25 * user.height - 5 * user.age + 5
            : 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;

    // Activity multipliers
    const activityMultipliers: Record<string, number> = {
        SEDENTARY: 1.2,
        LIGHTLY_ACTIVE: 1.375,
        MODERATELY_ACTIVE: 1.55,
        VERY_ACTIVE: 1.725,
        EXTREMELY_ACTIVE: 1.9,
    };

    const multiplier = activityMultipliers[user.activityLevel?.toUpperCase()] || 1.2;
    let tdee = bmr * multiplier;

    // Adjust based on primary goal
    const primaryGoal = goals.find((g) => g.isActive);
    if (primaryGoal) {
        switch (primaryGoal.type) {
            case 'FAT_LOSS':
                tdee *= 0.85; // 15% deficit
                break;
            case 'MUSCLE_GAIN':
                tdee *= 1.15; // 15% surplus
                break;
            case 'RECOMP':
                // Maintain TDEE
                break;
            default:
                // Maintenance or other goals
                break;
        }
    }

    // Macro distribution (can be customized based on goal)
    const proteinRatio = 0.3;
    const fatRatio = 0.25;
    const carbRatio = 0.45;

    return {
        calories: Math.round(tdee),
        protein: Math.round((tdee * proteinRatio) / 4),
        fats: Math.round((tdee * fatRatio) / 9),
        carbs: Math.round((tdee * carbRatio) / 4),
    };
};
