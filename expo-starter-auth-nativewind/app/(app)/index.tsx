import { router } from "expo-router";
import {
  MessageCircle,
  Plus,
  PlusCircleIcon,
  TargetIcon,
  User2Icon,
  UtensilsCrossed,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNutritionData } from "@/hooks/useNutritionData";;
import { MealLoggingModal } from "@/components/MeallogModal";
import { useAuth } from "@/context/AuthContext";
import { MacroRing, ProgressBar } from "@/components/home/MacroRing";
import GoalsForm from "@/components/home/GoalsForm";

export default function HomeScreen() {
  const { user } = useAuth();
  const name = user?.username ?? "User";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSetGoalsForm, setShowSetGoalsForm] = useState(false);
  const [goalInputs, setGoalInputs] = useState({
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });

  const {
    todayMeals,
    dailyTotals,
    dailyGoals,
    loading,
    refreshing,
    error,
    goalsMissing,
    updateGoals,
    fetchTodayMeals,
    fetchDailyGoals,
  } = useNutritionData();

  const onRefresh = () => {
    fetchTodayMeals(true);
    fetchDailyGoals();
  };

  const handleSetGoals = () => {
    const payload = {
      calories: Number(goalInputs.calories),
      protein: Number(goalInputs.protein),
      carbs: Number(goalInputs.carbs),
      fats: Number(goalInputs.fats),
    };
    updateGoals(payload);
    setShowSetGoalsForm(false);
    setGoalInputs({ calories: "", protein: "", carbs: "", fats: "" });
  };

  return (
    <>
      {loading && (
        <View className="absolute inset-0 flex-1 items-center justify-center bg-white/80">
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}

      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-neutral-950"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
        }
      >
        {/* Header */}
        <View className="p-6">
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-3xl mb-1 text-black font-semibold dark:text-white">
                Hi, {name}!
              </Text>
              <Text className="text-lg text-gray-500">Let's track your nutrition today</Text>
            </View>
            <View className="w-10 h-10 bg-green-600 rounded-full items-center justify-center">
              <User2Icon size={18} color="white" />
            </View>
          </View>

          <View className="w-full flex-row gap-3 mb-6 justify-between items-center">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center rounded-xl h-16 bg-green-600"
              onPress={() => router.replace("/(app)/chat")}
            >
              <MessageCircle size={18} color="white" />
              <Text className="text-white text-base ml-2 font-medium">Ask AI</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center rounded-xl h-16 border border-gray-300 bg-white"
              onPress={() => setIsModalOpen(true)}
            >
              <Plus size={18} color="black" />
              <Text className="text-black text-base ml-2 font-medium">Log Meal</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Section */}
        <View className="px-6 mb-6">
          <View className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-md border border-gray-200">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center gap-2">
                <TargetIcon size={24} color="black" />
                <Text className="text-xl text-black dark:text-white">Today's Progress</Text>
              </View>

              {goalsMissing && !showSetGoalsForm && (
                <TouchableOpacity
                  onPress={() => setShowSetGoalsForm(true)}
                  className="bg-green-500 px-3 py-1.5 rounded-full"
                >
                  <Text className="text-white text-sm font-medium">Set Daily Goals</Text>
                </TouchableOpacity>
              )}
            </View>
            {showSetGoalsForm ? (
              <View>
                <TouchableOpacity
                  className="absolute top-2 right-2"
                  onPress={() => setShowSetGoalsForm(false)}
                >
                  <X size={20} color="gray" />
                </TouchableOpacity>

                <GoalsForm
                  initial={{
                    calories: dailyGoals?.calories ?? undefined,
                    protein: dailyGoals?.protein ?? undefined,
                    carbs: dailyGoals?.carbs ?? undefined,
                    fats: dailyGoals?.fats ?? undefined,
                  }}
                  onSubmit={(payload) => {
                    // forward to your hook that updates goals
                    updateGoals(payload); // NOTE: updateGoals is the function from useNutritionData
                    setShowSetGoalsForm(false);
                    setGoalInputs({ calories: "", protein: "", carbs: "", fats: "" });
                  }}
                  onCancel={() => setShowSetGoalsForm(false)}
                  submitLabel="Save Goals"
                  loading={loading}
                />
              </View>
            ) : (
              dailyGoals && (
                <>
                  <View className="flex-row justify-center mb-4 gap-6 p-3">
                    <MacroRing
                      label="Calories"
                      current={dailyTotals.calories}
                      target={dailyGoals.calories ?? 1}
                      color="#3b82f6"
                    />
                    <MacroRing
                      label="Protein"
                      current={dailyTotals.protein}
                      target={dailyGoals.protein ?? 1}
                      color="#10b981"
                    />
                  </View>
                  <View className="gap-3">
                    <View>
                      <View className="flex-row justify-between items-center mb-1">
                        <Text>Carbs</Text>
                        <Text>
                          {dailyTotals.carbs}g / {dailyGoals?.carbs ?? "--"}g
                        </Text>
                      </View>
                      <ProgressBar
                        value={
                          dailyGoals?.carbs ? (dailyTotals.carbs / dailyGoals?.carbs) * 100 : 0
                        }
                      />
                    </View>

                    <View>
                      <View className="flex-row justify-between items-center mb-1">
                        <Text>Fats</Text>
                        <Text>
                          {dailyTotals.fats}g / {dailyGoals?.fats ?? "--"}g
                        </Text>
                      </View>
                      <ProgressBar
                        value={dailyGoals?.fats ? (dailyTotals.fats / dailyGoals?.fats) * 100 : 0}
                      />
                    </View>
                  </View>
                </>
              )
            )}
          </View>
        </View>

        {/* Meals Section */}
        <View className="px-6 mb-6">
          <View className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-md border border-gray-200">
            <View className="mb-3 flex-row justify-between items-center">
              <View className="flex flex-row gap-2">
                <UtensilsCrossed size={24} color="black" />
                <Text className="text-xl">Today's Meals</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsModalOpen(true)}
                className="p-2 rounded-full bg-green-50"
              >
                <PlusCircleIcon size={22} color="green" />
              </TouchableOpacity>
            </View>

            {error && (
              <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <Text className="text-red-600 text-sm text-center">{error}</Text>
              </View>
            )}

            {todayMeals.length === 0 && !error ? (
              <View className="py-8 items-center">
                <UtensilsCrossed size={32} color="#9ca3af" />
                <Text className="text-sm text-gray-500 text-center mt-2">
                  No meals logged today.
                </Text>
                <Text className="text-xs text-gray-400 text-center mt-1">
                  Tap the + button to log your first meal
                </Text>
              </View>
            ) : (
              todayMeals.map((meal, index) => (
                <View
                  key={meal.id ?? index}
                  className="flex-row justify-between py-3 border-b border-gray-200 last:border-b-0"
                >
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-900">{meal.customName}</Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      {meal.mealDate
                        ? new Date(meal.mealDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : "No time"}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-semibold text-gray-900">
                      {meal.calories} kcal
                    </Text>
                    <Text className="text-xs text-gray-500 capitalize mt-1">
                      {meal.mealType}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <MealLoggingModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={() => {
          fetchTodayMeals();
          setIsModalOpen(false);
        }}
      />
    </>
  );
}
