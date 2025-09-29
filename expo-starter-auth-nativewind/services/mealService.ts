import { fetchWithAuth } from "@/utils/apiWithAuth";

export interface MealData {
    id?: number;
    userId?: number;
    mealType: string;
    customName: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    servings: number;
    notes?: string | null;
    mealDate?: string;
    createdAt?: string;
    updatedAt?: string;
}
export interface MealPayload {
    userId: number;
    mealType: string;
    customName: string | null;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    servings: number;
    mealDate: string;
}

export interface AIGeneratedMeal {
    customName: string;
    mealType: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    servings: number;
}

export interface AIResponse {
    data: AIGeneratedMeal | { question: string };
}


// 🥗 Fetch today's meals
export const fetchTodayMealsApi = async (userId: number): Promise<MealData[]> => {
    const response = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/meals/today/${userId}`, {
        method: 'GET'
    });
    const data = await response.json()
    return data;
};

// 🎯 Fetch daily goals
export const fetchDailyGoalsApi = async () => {
    const response = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/goals/dailyGoals`, {
        method: 'GET'
    });
    const data = await response.json()
    return data.createDailyGoals;
};

// 🛠️ Update/set daily goals
export const updateDailyGoalsApi = async (
    payload: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    }
) => {
    const response = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/goals/dailyGoals`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
    const data = await response.json()
    return data.updatedGoals;
};
export const analyzeMealWithAI = async (message: string) => {

    try {
        const response = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/meals/ai`, {
            method: 'POST',
            body: JSON.stringify({
                message: message
            })
        });
        const data = response
        return data
    } catch (error: any) {
        throw new Error(error?.response?.data?.error || error?.message || 'AI analysis failed');
    }
}
export const saveMeal = async (payload: MealPayload) => {
    try {
        const response = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/meals`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (response.status === 201) {
            return true;
        }

        throw new Error('Unexpected response while saving meal');
    } catch (error: any) {
        throw new Error(error?.response?.data?.error || error?.message || 'Failed to save meal');
    }
}