import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import {
    ScrollView,
    View,
    Text,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
} from "react-native";
import { ArrowLeft, UtensilsCrossed } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/apiWithAuth";

// ✅ Define the shape of each meal
interface Meal {
    id: number;
    userId: number;
    mealType: string;
    customName: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    servings: number;
    mealDate: string;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function MealsScreen() {
    const { user } = useAuth();
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMeals = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/meals/${user.id}`, {
                method: "GET"
            });
            const data = await res.json();
            console.log(data);
            if (!res.ok) throw new Error(data?.message || "Failed to fetch meals");

            setMeals(data || []);
            console.log(meals);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchMeals();
    }, [fetchMeals]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMeals().finally(() => setRefreshing(false));
    };

    return (
        <View className="flex-1 bg-gray-50 dark:bg-neutral-950">
            <View className="px-6 pt-12 pb-6 flex-row items-center justify-between bg-white dark:bg-neutral-900 shadow-sm border-b border-gray-200">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ArrowLeft size={22} color="black" />
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-black dark:text-white">
                    All Logged Meals
                </Text>
                <View style={{ width: 30 }} />
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            ) : (
                <ScrollView
                    className="px-6 pt-4"
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
                    }
                >
                    {error && (
                        <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                            <Text className="text-red-600 text-sm text-center">{error}</Text>
                        </View>
                    )}

                    {meals.length === 0 && !error ? (
                        <View className="py-12 items-center">
                            <UtensilsCrossed size={32} color="#9ca3af" />
                            <Text className="text-sm text-gray-500 text-center mt-2">
                                No meals logged yet.
                            </Text>
                            <Text className="text-xs text-gray-400 text-center mt-1">
                                Go back and add your first meal!
                            </Text>
                        </View>
                    ) : (
                        meals.map((meal) => (
                            <View
                                key={meal.id}
                                className="flex-row justify-between py-3 border-b border-gray-200"
                            >
                                <View className="flex-1">
                                    <Text className="text-sm font-medium text-gray-900 dark:text-white">
                                        {meal.customName}
                                    </Text>
                                    <Text className="text-xs text-gray-500 mt-1">
                                        {meal.mealDate
                                            ? new Date(meal.mealDate).toLocaleString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })
                                            : "No date"}
                                    </Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {meal.calories} kcal
                                    </Text>
                                    <Text className="text-xs text-gray-500 capitalize mt-1">{meal.mealType}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}
        </View>
    );
}
