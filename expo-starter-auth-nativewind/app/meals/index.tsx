import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import {
    ScrollView,
    View,
    Text,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
} from "react-native";
import { ArrowLeft, UtensilsCrossed } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/apiWithAuth";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import { i18n } from "@/lib/i18next";

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
    const [handleLoading, setHandleLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [currentMeal, setCurrentMeal] = useState<Meal | null>(null);

    // Form state for editing
    const [customName, setCustomName] = useState("");
    const [calories, setCalories] = useState("");
    const [protein, setProtein] = useState("");
    const [carbs, setCarbs] = useState("");
    const [fats, setFats] = useState("");

    const fetchMeals = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/meals/${user.id}`, {
                method: "GET",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Failed to fetch meals");
            setMeals(data || []);
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

    const openEditModal = (meal: Meal) => {
        setCurrentMeal(meal);
        setCustomName(meal.customName);
        setCalories(meal.calories.toString());
        setProtein(meal.protein.toString());
        setCarbs(meal.carbs.toString());
        setFats(meal.fats.toString());
        setEditModalVisible(true);
    };

    const closeEditModal = () => {
        setEditModalVisible(false);
        setCurrentMeal(null);
    };

    const handleUpdateMeal = async () => {
        if (!currentMeal) return;

        // Validate inputs (simple numeric validation)
        if (
            isNaN(Number(calories)) ||
            isNaN(Number(protein)) ||
            isNaN(Number(carbs)) ||
            isNaN(Number(fats)) ||
            !customName.trim()
        ) {
            Toast.warn("Invalid input. Please enter valid values");
            return;
        }

        try {
            setHandleLoading(true)
            const res = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/meals/${currentMeal.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    customName: customName.trim(),
                    calories: Number(calories),
                    protein: Number(protein),
                    carbs: Number(carbs),
                    fats: Number(fats),
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                Toast.error(i18n.t("toast.mealNotUpdated.title"))
                throw new Error(data?.message || "Failed to update meal");
            }
            Toast.success(i18n.t("toast.mealUpdated.title"))
            // Update local state
            setMeals((prevMeals) =>
                prevMeals.map((meal) =>
                    meal.id === currentMeal.id
                        ? { ...meal, customName: customName.trim(), calories: Number(calories), protein: Number(protein), carbs: Number(carbs), fats: Number(fats) }
                        : meal
                )
            );

            closeEditModal();
        } catch (err: any) {
            Alert.alert("Error", err.message || "Something went wrong updating the meal.");
        }
        finally {
            setHandleLoading(false)
        }
    };

    const handleDeleteMeal = (mealId: number) => {
        Alert.alert("Delete Meal", "Are you sure you want to delete this meal?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        const res = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/meals/${mealId}`, {
                            method: "DELETE",
                        });
                        if (!res.ok) {
                            Toast.error(i18n.t("toast.mealNotDeleted.title"))
                            const data = await res.json();
                            console.log("error is", data);

                            throw new Error(data?.message || "Failed to delete meal");
                        }
                        // Remove from local state
                        Toast.success(i18n.t("toast.mealDeleted.title"))
                        setMeals((prevMeals) => prevMeals.filter((meal) => meal.id !== mealId));
                    } catch (err: any) {
                        Alert.alert("Error", err.message || "Something went wrong deleting the meal.");
                    }
                },
            },
        ]);
    };

    return (
        <>
            {loading && (
                <View className="absolute inset-0 flex-1 items-center justify-center bg-white/80">
                    <ActivityIndicator size="large" color="#000" />
                </View>
            )}
            <ScrollView
                className="flex-1 bg-gray-50 dark:bg-neutral-950 pb-6"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
                }
            >
                <View className="px-6 pt-6 pb-3 flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 bg-gray-200 rounded-lg">
                        <ArrowLeft className="" size={22} color="black" />
                    </TouchableOpacity>
                    <Text className="text-xl font-semibold text-black dark:text-white">Meal History</Text>
                    <View style={{ width: 30 }} />
                </View>
                <View className="pb-6">
                    {meals.length === 0 && !error ? (
                        <View className="py-12 items-center">
                            <UtensilsCrossed size={32} color="#9ca3af" />
                            <Text className="text-sm text-gray-500 text-center mt-2">No meals logged yet.</Text>
                            <Text className="text-xs text-gray-400 text-center mt-1">Go back and add your first meal!</Text>
                        </View>
                    ) : (
                        meals.map((meal) => (
                            <View
                                key={meal.id}
                                className="flex-row justify-between py-3 border-3 border-black items-center px-6"
                            >
                                <View className="flex-1">
                                    <Text className="text-sm font-medium text-gray-900 dark:text-white">{meal.customName}</Text>
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

                                    <View className="flex-row space-x-3 mt-2 gap-3">
                                        <Text className="text-sm text-gray-700 dark:text-gray-300">
                                            Protein: <Text className="font-semibold">{meal.protein}g</Text>
                                        </Text>
                                        <Text className="text-sm text-gray-700 dark:text-gray-300">
                                            Carbs: <Text className="font-semibold">{meal.carbs}g</Text>
                                        </Text>
                                        <Text className="text-sm text-gray-700 dark:text-gray-300">
                                            Fats: <Text className="font-semibold">{meal.fats}g</Text>
                                        </Text>
                                    </View>
                                </View>

                                <View className="items-end">
                                    <Text className="text-sm font-semibold text-gray-900 dark:text-white">{meal.calories} kcal</Text>
                                    <Text className="text-xs font-bold text-gray-500 capitalize my-1">{meal.mealType}</Text>

                                    <View className="flex-row gap-2">
                                        <TouchableOpacity
                                            onPress={() => openEditModal(meal)}
                                            className=" px-2 py-1 rounded bg-blue-500"
                                            style={{ marginBottom: 4 }}
                                        >
                                            <Text className="text-white text-sm font-semibold">Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleDeleteMeal(meal.id)}
                                            className="px-2 py-1 rounded bg-red-500"
                                            style={{ marginBottom: 4 }}
                                        >
                                            <Text className="text-white text-sm font-semibold">Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}

                </View>

            </ScrollView>
            {/* Edit Modal */}
            <Modal visible={editModalVisible} animationType="fade" transparent={true}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.4)",
                        justifyContent: "center",
                        padding: 20,
                    }}
                >
                    <View
                        style={{
                            backgroundColor: "white",
                            borderRadius: 8,
                            padding: 20,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 4,
                            elevation: 5,
                        }}
                    >
                        <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>Edit Meal</Text>

                        <Text style={{ fontSize: 14, marginBottom: 4 }}>Name</Text>
                        <TextInput
                            value={customName}
                            onChangeText={setCustomName}
                            placeholder="Meal Name"
                            style={{
                                borderWidth: 1,
                                borderColor: "#ccc",
                                borderRadius: 4,
                                paddingHorizontal: 8,
                                paddingVertical: 6,
                                marginBottom: 10,
                            }}
                        />

                        <Text style={{ fontSize: 14, marginBottom: 4 }}>Calories</Text>
                        <TextInput
                            keyboardType="numeric"
                            value={calories}
                            onChangeText={setCalories}
                            placeholder="Calories"
                            style={{
                                borderWidth: 1,
                                borderColor: "#ccc",
                                borderRadius: 4,
                                paddingHorizontal: 8,
                                paddingVertical: 6,
                                marginBottom: 10,
                            }}
                        />

                        <Text style={{ fontSize: 14, marginBottom: 4 }}>Protein (g)</Text>
                        <TextInput
                            keyboardType="numeric"
                            value={protein}
                            onChangeText={setProtein}
                            placeholder="Protein"
                            style={{
                                borderWidth: 1,
                                borderColor: "#ccc",
                                borderRadius: 4,
                                paddingHorizontal: 8,
                                paddingVertical: 6,
                                marginBottom: 10,
                            }}
                        />

                        <Text style={{ fontSize: 14, marginBottom: 4 }}>Carbs (g)</Text>
                        <TextInput
                            keyboardType="numeric"
                            value={carbs}
                            onChangeText={setCarbs}
                            placeholder="Carbs"
                            style={{
                                borderWidth: 1,
                                borderColor: "#ccc",
                                borderRadius: 4,
                                paddingHorizontal: 8,
                                paddingVertical: 6,
                                marginBottom: 10,
                            }}
                        />

                        <Text style={{ fontSize: 14, marginBottom: 4 }}>Fats (g)</Text>
                        <TextInput
                            keyboardType="numeric"
                            value={fats}
                            onChangeText={setFats}
                            placeholder="Fats"
                            style={{
                                borderWidth: 1,
                                borderColor: "#ccc",
                                borderRadius: 4,
                                paddingHorizontal: 8,
                                paddingVertical: 6,
                                marginBottom: 20,
                            }}
                        />

                        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                            <TouchableOpacity
                                onPress={closeEditModal}
                                style={{
                                    paddingHorizontal: 15,
                                    paddingVertical: 10,
                                    marginRight: 10,
                                    borderRadius: 4,
                                    backgroundColor: "#ccc",
                                }}
                            >
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleUpdateMeal}
                                style={{
                                    paddingHorizontal: 15,
                                    paddingVertical: 10,
                                    borderRadius: 4,
                                    backgroundColor: "#3b82f6",
                                }}
                            >
                                {
                                    handleLoading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={{ color: "white", fontWeight: "600" }}>Save</Text>
                                    )
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </>
    );
}
