export const normalizeForPrisma = (obj: Record<string, any>) => {
    return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, v === undefined ? null : v])
    );
};

// src/utils.ts
export function formatMealsSummary(meals: { mealType: string; calories: number }[]) {
    if (!meals || meals.length === 0) return '';
    return meals
        .map(m => `- ${m.mealType}: ${m.calories.toFixed(0)} kcal`)
        .join('\n');
}
