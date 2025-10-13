import { fetchWithAuth } from "@/utils/apiWithAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ProgressStats {
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFats: number;
  adherence: number;
  totalMeals: number;
  loggedDays: number;
}

export interface Achievement {
  title: string;
  description: string;
  earned: boolean;
  progress: number;
}

export interface WeightProgress {
  date: string;
  weight: number;
}

export interface MacroDistribution {
  value: number;
  color: string;
  label: string;
}

export interface DailyTotal {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meals: number;
}

export interface ProgressAnalytics {
  period: string;
  stats: ProgressStats;
  weightProgress: WeightProgress[];
  macroDistribution: MacroDistribution[];
  achievements: Achievement[];
  dailyTotals: DailyTotal[];
}

export interface NutritionTrend {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface TrendsResponse {
  trends: NutritionTrend[];
}

// Generic fetch wrapper with auth token and type safety
export const makeRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = await AsyncStorage.getItem("auth_token");

  const response = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  return response.json();
};

// Fetch progress analytics (week, month, quarter)
export const getProgressAnalytics = async (
  period: "week" | "month" | "quarter" = "week",
): Promise<ProgressAnalytics> => {
  return makeRequest<ProgressAnalytics>(`/analytics/progress?period=${period}`);
};

// Fetch nutrition trends (week, month, quarter)
export const getNutritionTrends = async (
  period: "week" | "month" | "quarter" = "week",
): Promise<TrendsResponse> => {
  return makeRequest<TrendsResponse>(`/analytics/trends?period=${period}`);
};
