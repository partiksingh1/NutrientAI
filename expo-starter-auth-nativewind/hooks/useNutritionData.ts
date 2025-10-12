import { useEffect, useState } from "react";
import { Toast } from "toastify-react-native";
import {
    fetchDailyGoalsApi,
    fetchTodayMealsApi,
    updateDailyGoalsApi,
    MealData,
} from "@/services/mealService";
import { useAuth } from "@/context/AuthContext";

export function useNutritionData() {
    const { user } = useAuth();
    const [todayMeals, setTodayMeals] = useState<MealData[]>([]);
    const [dailyGoals, setDailyGoals] = useState<{
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    } | null>(null);
    const [dailyTotals, setDailyTotals] = useState({
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
    });
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [goalsMissing, setGoalsMissing] = useState(false);

    const fetchDailyGoals = async (isRefresh = false) => {
        if (!user?.id) return;
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const data = await fetchDailyGoalsApi();
            setDailyGoals(data);

            const missing =
                !data ||
                data.calories === null ||
                data.protein === null ||
                data.carbs === null ||
                data.fats === null;

            setGoalsMissing(missing);
        } catch (err: any) {
            console.error("Error fetching daily goals:", err);
            setError(err?.response?.data?.message || "Failed to load goals");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const updateGoals = async (payload: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    }) => {
        try {
            setLoading(true);
            const updated = await updateDailyGoalsApi(payload);
            setDailyGoals(updated);
            setGoalsMissing(false);
            Toast.show({
                type: "success",
                text1: "Goals updated successfully!",
                text2: "Your daily goals have been saved.",
            });
            fetchDailyGoals();
        } catch (err: any) {
            console.error("Error updating goals:", err);
            setError(err?.response?.data?.message || "Failed to update goals");
            Toast.show({
                type: "error",
                text1: "Update Failed",
                text2: err?.response?.data?.error || "Please try again",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchTodayMeals = async (isRefresh = false) => {
        if (!user?.id) return;
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const data = await fetchTodayMealsApi(Number(user.id));
            setTodayMeals(data);

            const totals = data.reduce(
                (acc, meal) => ({
                    calories: acc.calories + meal.calories,
                    protein: acc.protein + meal.protein,
                    carbs: acc.carbs + meal.carbs,
                    fats: acc.fats + meal.fats,
                }),
                { calories: 0, protein: 0, carbs: 0, fats: 0 },
            );
            setDailyTotals(totals);
        } catch (err: any) {
            console.error("Error fetching today's meals:", err);
            setError(err?.response?.data?.message || "Failed to load meals");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTodayMeals();
        fetchDailyGoals();
    }, [user?.id]);

    return {
        todayMeals,
        dailyTotals,
        dailyGoals,
        loading,
        refreshing,
        error,
        goalsMissing,
        setGoalsMissing,
        fetchTodayMeals,
        fetchDailyGoals,
        updateGoals,
        setError,
        setLoading,
    };
}
