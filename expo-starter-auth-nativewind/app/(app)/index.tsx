import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import {
  MessageCircle,
  Plus,
  PlusCircleIcon,
  TargetIcon,
  TrendingUp,
  User2Icon,
  UtensilsCrossed,
} from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '@/context/AuthContext';
import { MealLoggingModal } from '@/components/MealLog'; // assuming this is already implemented

// --- Reusable Button Component ---
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

// --- Progress Bar Component ---
const Progress = ({ value }: { value: number }) => (
  <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
    <View className="h-2 bg-blue-500" style={{ width: `${value}%` }} />
  </View>
);

// --- Macro Ring Component ---
const MacroRing = ({
  label,
  current,
  target,
  color,
}: {
  label: string;
  current: number;
  target: number;
  color: string;
}) => {
  const percentage = (current / target) * 100;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

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
          <Text className="text-xs text-gray-500">/{target}</Text>
        </View>
      </View>
      <Text className="text-xs mt-4">{label}</Text>
    </View>
  );
};
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// --- Main Screen Component ---
export default function HomeScreen() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meals, setMeals] = useState<MealData[]>([]);

  const name = user?.username ?? 'User';
  const email = user?.email ?? 'No email';

  const dailyGoals = {
    calories: { current: 1850, target: 2200 },
    protein: { current: 95, target: 120 },
    carbs: { current: 180, target: 220 },
    fats: { current: 65, target: 85 },
  };

  const todayMeals = [
    { time: '8:30 AM', name: 'Greek Yogurt Bowl', calories: 320, type: 'breakfast' },
    { time: '12:45 PM', name: 'Chicken Caesar Salad', calories: 480, type: 'lunch' },
    { time: '3:15 PM', name: 'Apple & Almond Butter', calories: 190, type: 'snack' },
  ];

  const handleSaveMeal = (newMeal: MealData) => {
    setMeals((prev) => [...prev, newMeal]);
  };

  return (
    <>
      <ScrollView className="flex-1 bg-gray-50 dark:bg-neutral-950">
        {/* Header */}
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

          {/* Quick Actions */}
          <View className="w-full flex-row gap-2 mb-6 justify-between items-center">
            <Button variant="default">
              <MessageCircle size={18} color="white" /> Ask AI
            </Button>
            <Button variant="outline" onPress={() => {
              setIsModalOpen(true)
            }}>
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
                  current={dailyGoals.calories.current}
                  target={dailyGoals.calories.target}
                  color="#3b82f6"
                />
                <MacroRing
                  label="Protein"
                  current={dailyGoals.protein.current}
                  target={dailyGoals.protein.target}
                  color="#10b981"
                />
              </View>
              <View className="gap-3">
                <View>
                  <View className="flex-row justify-between items-center mb-1">
                    <Text>Carbs</Text>
                    <Text>{dailyGoals.carbs.current}g / {dailyGoals.carbs.target}g</Text>
                  </View>
                  <Progress value={(dailyGoals.carbs.current / dailyGoals.carbs.target) * 100} />
                </View>
                <View>
                  <View className="flex-row justify-between mb-1">
                    <Text>Fats</Text>
                    <Text>{dailyGoals.fats.current}g / {dailyGoals.fats.target}g</Text>
                  </View>
                  <Progress value={(dailyGoals.fats.current / dailyGoals.fats.target) * 100} />
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
              {todayMeals.map((meal, index) => (
                <View
                  key={index}
                  className="flex-row justify-between py-3 border-b border-gray-200"
                >
                  <View>
                    <Text className="text-sm">{meal.name}</Text>
                    <Text className="text-xs text-gray-500">{meal.time}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm">{meal.calories} kcal</Text>
                    <Text className="text-xs text-gray-500 capitalize">{meal.type}</Text>
                  </View>
                </View>
              ))}
              <Text className="text-xs text-gray-500 text-center mt-2">
                Still need: 350 kcal for dinner
              </Text>
            </View>
          </View>
        </View>

        {/* Weekly Trend */}
        <View className="px-6 pb-6">
          <View className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-md border border-gray-300">
            <View className="mb-3">
              <View className="text-base font-semibold text-black dark:text-white flex-row gap-2 items-center">
                <TrendingUp size={18} />
                <Text>This Week</Text>
              </View>
            </View>
            <View>
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-2xl">4.2</Text>
                  <Text className="text-xs text-gray-500">Avg daily rating</Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm text-green-600">+2.3%</Text>
                  <Text className="text-xs text-gray-500">vs last week</Text>
                </View>
              </View>
              {days.map((day, index) => (
                <View key={day} className="items-center">
                  <Text className="text-xs text-gray-500 mb-1">{day}</Text>
                  <View
                    className={`w-6 h-6 rounded-full ${index < 5 ? 'bg-blue-500' : 'bg-gray-300'} ${index === 4 ? 'border-2 border-blue-300' : ''}`}
                  />
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Meal Modal */}
      <MealLoggingModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(mealData) => {
          handleSaveMeal(mealData);
          setIsModalOpen(false);
        }}
      />
    </>
  );
}

// --- Types ---
interface MealData {
  customName: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servings: number;
}
