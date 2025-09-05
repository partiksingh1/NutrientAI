// utils.ts
// export const requiredFieldsMissing = (obj: any) => {
//     const missing: string[] = [];
//     if (!obj.calories) missing.push("calories");
//     if (!obj.customName && !obj.mealType) missing.push("customName_or_mealType");
//     return missing;
// };

// export const mergePartial = (oldPartial: any, newFields: any) => {
//     const merged = {
//         ...(oldPartial ?? {}),
//         ...Object.entries(newFields).reduce((acc, [k, v]) => {
//             if (v !== null && v !== undefined && v !== "") acc[k] = v;
//             return acc;
//         }, {} as any),
//     };
//     if (oldPartial?.confidence && newFields.confidence) {
//         merged.confidence = {
//             mealType: newFields.confidence?.mealType ?? oldPartial.confidence.mealType,
//             customName: newFields.confidence?.customName ?? oldPartial.confidence.customName,
//             calories: newFields.confidence?.calories ?? oldPartial.confidence.calories,
//         };
//     }
//     return merged;
// };

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
