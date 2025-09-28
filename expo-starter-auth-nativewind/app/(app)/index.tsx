import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import {
  MessageCircle,
  Plus,
  PlusCircleIcon,
  TargetIcon,
  User2Icon,
  UtensilsCrossed,
  X,
} from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '@/context/AuthContext';
import { MealLoggingModal } from '@/components/MeallogModal';
import Button from '@/components/Button';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast } from 'toastify-react-native';
import { router } from 'expo-router';

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


const Progress = ({ value }: { value: number }) => (
  <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
    <View className="h-2 bg-blue-500" style={{ width: `${value}%` }} />
  </View>
);

const MacroRing = ({
  label,
  current,
  target,
  color,
}: {
  label: string;
  current: number;
  target?: number;
  color: string;
}) => {
  const percentage = target ? (current / target) * 100 : 0;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = target
    ? circumference - (percentage / 100) * circumference
    : circumference;

  return (
    <View className="items-center">
      <View className="relative w-full p-2 h-20">
        <Svg width="80" height="80" style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle cx="40" cy="40" r={radius} stroke="#e5e7eb" strokeWidth="6" fill="none" />
          <Circle
            cx="40"
            cy="40"
            r={radius}
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        <View className="absolute inset-0 items-center justify-center mt-4">
          <Text className="text-xs">{current}</Text>
          <Text className="text-xs text-gray-500">/ {target ?? '--'}</Text>
        </View>
      </View>
      <Text className="text-xs mt-4">{label}</Text>
    </View>
  );
};

export default function HomeScreen() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [todayMeals, setTodayMeals] = useState<MealData[]>([]);
  const [dailyTotals, setDailyTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyGoals, setDailyGoals] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  } | null>(null);
  const [showSetGoalsForm, setShowSetGoalsForm] = useState(false);
  const [goalsMissing, setGoalsMissing] = useState(false);
  const [goalInputs, setGoalInputs] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
  });




  const name = user?.username ?? 'User';

  const fetchDailyGoals = async (isRefresh = false) => {
    const token = await AsyncStorage.getItem("auth_token");
    if (!user?.id) return;

    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);

      const resp = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/goals/dailyGoals/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = resp.data.createDailyGoals;
      setDailyGoals(data);

      const isAnyNull =
        !data ||
        data.calories === null ||
        data.protein === null ||
        data.carbs === null ||
        data.fats === null;

      setGoalsMissing(isAnyNull);
    } catch (error: any) {
      console.error("Error fetching Daily goals", error);
      setError(error?.response?.data?.message || 'Failed to load goals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const handleSetGoals = async () => {
    const token = await AsyncStorage.getItem("auth_token");
    if (!user?.id) return;

    const payload = {
      calories: Number(goalInputs.calories),
      protein: Number(goalInputs.protein),
      carbs: Number(goalInputs.carbs),
      fats: Number(goalInputs.fats),
    };

    try {
      setLoading(true);

      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/goals/dailyGoals/${user.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Toast.show({
        type: 'success',
        text1: 'Goals updated successfully!',
        text2: 'Your daily goals have been saved.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
      });

      setDailyGoals(response.data.updatedGoals);
      setShowSetGoalsForm(false);
      setGoalsMissing(false);
      setGoalInputs({ calories: '', protein: '', carbs: '', fats: '' });
      fetchDailyGoals();
    } catch (error: any) {
      console.error('Error updating goals:', error);
      setError(error?.response?.data?.message || 'Failed to update goals');

      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error?.response?.data?.error || 'Please try again',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
      });
    } finally {
      setLoading(false);
    }
  };



  const fetchTodayMeals = async (isRefresh = false) => {
    if (!user?.id) return;
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const resp = await axios.get<MealData[]>(
        `${process.env.EXPO_PUBLIC_API_URL}/meals/today/${user.id}`
      );
      const data = resp.data;
      setTodayMeals(data);

      const totals = data.reduce(
        (acc, meal) => {
          acc.calories += meal.calories;
          acc.protein += meal.protein;
          acc.carbs += meal.carbs;
          acc.fats += meal.fats;
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      );
      setDailyTotals(totals);
    } catch (error: any) {
      console.error("Error fetching today's meals:", error);
      setError(error?.response?.data?.message || 'Failed to load meals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTodayMeals();
    fetchDailyGoals();
  }, [user?.id]);

  const handleSaveMeal = (newMeal: MealData) => {
    fetchTodayMeals();
  };

  const onRefresh = () => {
    fetchTodayMeals(true);
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3b82f6"
          />
        }
      >
        <View className="p-6 pb-4 mt-4">
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-3xl mb-1 text-black font-semibold dark:text-white">
                Hi, {name}!
              </Text>
              <Text className="text-lg text-gray-500">Let's track your nutrition today</Text>
            </View>
            <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center">
              <User2Icon size={18} color="white" />
            </View>
          </View>

          <View className="w-full flex-row gap-3 mb-6 justify-between items-center">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center rounded-xl h-16 px-6 bg-blue-600"
              onPress={() => { router.replace('/(app)/chat') }}
            >
              <MessageCircle size={18} color="white" />
              <Text className="text-white text-base ml-2 font-medium">Ask AI</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center rounded-xl h-16 px-6 border border-gray-300 bg-white"
              onPress={() => setIsModalOpen(true)}
            >
              <Plus size={18} color="black" />
              <Text className="text-black text-base ml-2 font-medium">Log Meal</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Overview */}
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
                  className="bg-blue-500 px-3 py-1.5 rounded-full"
                >
                  <Text className="text-white text-sm font-medium">Set Daily Goals</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Show input form */}
            {showSetGoalsForm ? (
              <View className="relative bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
                <TouchableOpacity
                  className="absolute top-2 right-2"
                  onPress={() => setShowSetGoalsForm(false)}
                >
                  <X size={20} color="gray" />
                </TouchableOpacity>

                {['calories', 'protein', 'carbs', 'fats'].map((macro) => (
                  <View key={macro} className="mb-3">
                    <Text className="mb-1 capitalize text-sm text-black dark:text-white">
                      {macro}
                    </Text>
                    <TextInput
                      keyboardType="numeric"
                      placeholder={`Enter ${macro}`}
                      value={goalInputs[macro as keyof typeof goalInputs]}
                      onChangeText={(value) =>
                        setGoalInputs((prev) => ({ ...prev, [macro]: value }))
                      }
                      className="border border-gray-300 rounded-md px-3 py-2 bg-white text-black"
                    />
                  </View>
                ))}

                <TouchableOpacity
                  className="mt-3 bg-blue-600 rounded-md py-3 items-center"
                  onPress={handleSetGoals}
                >
                  <Text className="text-white font-semibold text-base">Save Goals</Text>
                </TouchableOpacity>
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
                          {dailyTotals.carbs}g / {dailyGoals?.carbs ?? '--'}g
                        </Text>
                      </View>
                      <Progress
                        value={
                          dailyGoals?.carbs
                            ? (dailyTotals.carbs / dailyGoals?.carbs) * 100
                            : 0
                        }
                      />
                    </View>
                    <View>
                      <View className="flex-row justify-between items-center mb-1">
                        <Text>Fats</Text>
                        <Text>
                          {dailyTotals.fats}g / {dailyGoals?.fats ?? '--'}g
                        </Text>
                      </View>
                      <Progress
                        value={
                          dailyGoals?.fats
                            ? (dailyTotals.fats / dailyGoals?.fats) * 100
                            : 0
                        }
                      />
                    </View>
                  </View>
                </>
              )
            )}
          </View>
        </View>



        {/* Today's Meals */}
        <View className="px-6 mb-6">
          <View className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-md border border-gray-300">
            <View className="mb-3">
              <View className="flex-row justify-between items-center">
                <View className="flex flex-row text-black dark:text-white gap-2">
                  <UtensilsCrossed size={24} color="black" />
                  <Text className="text-xl">Today's Meals</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsModalOpen(true)}
                  className="p-2 rounded-full bg-blue-50"
                >
                  <PlusCircleIcon size={22} color="#3b82f6" />
                </TouchableOpacity>
              </View>
            </View>
            <View>
              {error && (
                <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <Text className="text-red-600 text-sm text-center">{error}</Text>
                </View>
              )}
              {todayMeals.map((meal, index) => (
                <View
                  key={meal.id || index}
                  className="flex-row justify-between py-3 border-b border-gray-200 last:border-b-0"
                >
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-900">{meal.customName}</Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      {meal?.mealDate
                        ? new Date(meal.mealDate).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        : 'No time'}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-semibold text-gray-900">{meal.calories} kcal</Text>
                    <Text className="text-xs text-gray-500 capitalize mt-1">
                      {meal.mealType}
                    </Text>
                  </View>
                </View>
              ))}
              {todayMeals.length === 0 && !error && (
                <View className="py-8 items-center">
                  <UtensilsCrossed size={32} color="#9ca3af" />
                  <Text className="text-sm text-gray-500 text-center mt-2">
                    No meals logged today.
                  </Text>
                  <Text className="text-xs text-gray-400 text-center mt-1">
                    Tap the + button to log your first meal
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <MealLoggingModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(mealData: MealData) => {
          handleSaveMeal(mealData);
          setIsModalOpen(false);
        }}
      />
    </>
  );
}
