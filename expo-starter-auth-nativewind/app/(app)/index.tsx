import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  MessageCircle,
  Plus,
  PlusCircleIcon,
  TargetIcon,
  User2Icon,
  UtensilsCrossed,
} from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '@/context/AuthContext';
import { MealLoggingModal } from '@/components/MeallogModal';
import axios from 'axios';

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

const Button = ({ variant = 'default', children, onPress }: any) => {
  const base = 'flex-row items-center justify-center rounded-xl h-16 px-12';
  const styles =
    variant === 'default'
      ? 'bg-black'
      : variant === 'outline'
        ? 'border border-gray-300 bg-white'
        : 'bg-transparent';

  const textColor = variant === 'default' ? 'text-white' : 'text-black';

  return (
    <TouchableOpacity onPress={onPress} className={`${base} ${styles}`}>
      <View className="flex-row items-center space-x-2">
        {React.Children.map(children, (child) =>
          typeof child === 'string' ? (
            <Text className={`${textColor} text-base`}>{child}</Text>
          ) : (
            child
          )
        )}
      </View>
    </TouchableOpacity>
  );
};

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

  const name = user?.username ?? 'User';

  const dailyGoals = {
    calories: { target: undefined }, // Or set to a number if you have user-specific goals
    protein: { target: undefined },
    carbs: { target: undefined },
    fats: { target: undefined },
  };

  const fetchTodayMeals = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
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
    } catch (error) {
      console.error("Error fetching today's meals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayMeals();
  }, [user?.id]);

  const handleSaveMeal = (newMeal: MealData) => {
    fetchTodayMeals();
  };

  return (
    <>
      {loading && (
        <View className="absolute inset-0 flex-1 items-center justify-center bg-white/80">
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}
      <ScrollView className="flex-1 bg-gray-50 dark:bg-neutral-950">
        <View className="p-6 pb-4 mt-4">
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-3xl mb-1 text-black font-semibold dark:text-white">
                Good morning, {name}!
              </Text>
              <Text className="text-lg text-gray-500">Let's track your nutrition today</Text>
            </View>
            <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center">
              <User2Icon size={18} color="white" />
            </View>
          </View>

          <View className="w-full flex-row gap-2 mb-6 justify-between items-center">
            <Button variant="default">
              <MessageCircle size={18} color="white" /> Ask AI
            </Button>
            <Button variant="outline" onPress={() => setIsModalOpen(true)}>
              <Plus size={18} color="black" /> Log Meal
            </Button>
          </View>
        </View>

        {/* Daily Overview */}
        <View className="px-6 mb-6">
          <View className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-md border-gray-300 border">
            <View className="mb-3">
              <View className="flex flex-row text-black dark:text-white gap-2">
                <TargetIcon size={24} color="black" />
                <Text className="text-xl">Today's Progress</Text>
              </View>
            </View>
            <View>
              <View className="flex-row justify-center mb-4 gap-6 p-3">
                <MacroRing
                  label="Calories"
                  current={dailyTotals.calories}
                  target={dailyGoals.calories.target}
                  color="#3b82f6"
                />
                <MacroRing
                  label="Protein"
                  current={dailyTotals.protein}
                  target={dailyGoals.protein.target}
                  color="#10b981"
                />
              </View>
              <View className="gap-3">
                <View>
                  <View className="flex-row justify-between items-center mb-1">
                    <Text>Carbs</Text>
                    <Text>
                      {dailyTotals.carbs}g / {dailyGoals.carbs.target ?? '--'}g
                    </Text>
                  </View>
                  <Progress
                    value={
                      dailyGoals.carbs.target
                        ? (dailyTotals.carbs / dailyGoals.carbs.target) * 100
                        : 0
                    }
                  />
                </View>
                <View>
                  <View className="flex-row justify-between mb-1">
                    <Text>Fats</Text>
                    <Text>
                      {dailyTotals.fats}g / {dailyGoals.fats.target ?? '--'}g
                    </Text>
                  </View>
                  <Progress
                    value={
                      dailyGoals.fats.target
                        ? (dailyTotals.fats / dailyGoals.fats.target) * 100
                        : 0
                    }
                  />
                </View>
              </View>
            </View>
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
                <TouchableOpacity onPress={() => setIsModalOpen(true)}>
                  <PlusCircleIcon size={22} color="black" />
                </TouchableOpacity>
              </View>
            </View>
            <View>
              {todayMeals.map((meal) => (
                <View
                  key={meal.id}
                  className="flex-row justify-between py-3 border-b border-gray-200"
                >
                  <View>
                    <Text className="text-sm">{meal.customName}</Text>
                    <Text className="text-xs text-gray-500">
                      {meal?.mealDate
                        ? new Date(meal.mealDate).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        : 'No time'}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm">{meal.calories} kcal</Text>
                    <Text className="text-xs text-gray-500 lowercase">
                      {meal.mealType}
                    </Text>
                  </View>
                </View>
              ))}
              {todayMeals.length === 0 && (
                <Text className="text-sm text-gray-500 text-center mt-4">
                  No meals logged today.
                </Text>
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
