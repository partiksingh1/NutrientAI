import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "toastify-react-native";

import { fetchWithAuth } from "@/utils/apiWithAuth";

const AUTH_TOKEN_KEY = "auth_token";
const USER_DATA_KEY = "user_data";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  weight?: number;
  height?: number;
  age?: number;
  gender?: string;
  activityLevel?: string;
  profile_completed: boolean;
  preferences?: {
    id: number;
    mealFrequency: number;
    snackIncluded: boolean;
    dietType: string;
    allergies?: string;
  };
  dietaryGoals?: {
    id: number;
    type: string;
    description?: string;
    startDate: string;
    endDate?: string;
  }[];
}

export interface UpdateProfileData {
  username?: string;
  weight?: number;
  height?: number;
  age?: number;
  gender?: string;
  activityLevel?: string;
}

export interface UpdatePreferencesData {
  mealFrequency?: number;
  snackIncluded?: boolean;
  dietType?: string;
  allergies?: string;
}

export interface DailyGoals {
  id: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}
/**
 * Get the current user's profile from the server
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/user/profile`, {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch profile");
    }

    const data = await response.json();
    return data.user;
  } catch (error: any) {
    console.error("Get user profile error:", error);
    throw new Error(error.message || "Failed to fetch profile");
  }
};

/**
 * Update the user's profile
 */
export const updateUserProfile = async (profileData: UpdateProfileData): Promise<UserProfile> => {
  try {
    const response = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/user/profile`, {
      method: "PUT",
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update profile");
    }

    const data = await response.json();

    // Update local storage with new user data
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));

    Toast.show({
      type: "success",
      text1: "Profile Updated",
      text2: "Your profile has been updated successfully",
      position: "top",
      visibilityTime: 3000,
      autoHide: true,
    });

    return data.user;
  } catch (error: any) {
    console.error("Update user profile error:", error);
    Toast.show({
      type: "error",
      text1: "Update Failed",
      text2: error.message || "Failed to update profile",
      position: "top",
      visibilityTime: 3000,
      autoHide: true,
    });
    throw new Error(error.message || "Failed to update profile");
  }
};

/**
 * Update the user's preferences
 */
export const updateUserPreferences = async (
  preferencesData: UpdatePreferencesData,
): Promise<any> => {
  try {
    const response = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/user/preferences`, {
      method: "PUT",
      body: JSON.stringify(preferencesData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update preferences");
    }

    const data = await response.json();

    Toast.show({
      type: "success",
      text1: "Preferences Updated",
      text2: "Your preferences have been updated successfully",
      position: "top",
      visibilityTime: 3000,
      autoHide: true,
    });

    return data.preferences;
  } catch (error: any) {
    console.error("Update preferences error:", error);
    Toast.show({
      type: "error",
      text1: "Update Failed",
      text2: error.message || "Failed to update preferences",
      position: "top",
      visibilityTime: 3000,
      autoHide: true,
    });
    throw new Error(error.message || "Failed to update preferences");
  }
};

/**
 * Delete the user's account
 */
export const deleteUserAccount = async (): Promise<void> => {
  try {
    const response = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/user/account`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete account");
    }

    // Clear local storage
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);

    Toast.show({
      type: "success",
      text1: "Account Deleted",
      text2: "Your account has been deleted successfully",
      position: "top",
      visibilityTime: 3000,
      autoHide: true,
    });
  } catch (error: any) {
    console.error("Delete account error:", error);
    Toast.show({
      type: "error",
      text1: "Delete Failed",
      text2: error.message || "Failed to delete account",
      position: "top",
      visibilityTime: 3000,
      autoHide: true,
    });
    throw new Error(error.message || "Failed to delete account");
  }
};

export const getDailyGoals = async (): Promise<DailyGoals> => {
  const response = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/goals/dailyGoals`, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch daily goals");
  }

  const data = await response.json();
  console.log("getDailyGoals is ", getDailyGoals);

  return data.createDailyGoals;
};

export const updateDailyGoals = async (userId: number, goals: Partial<DailyGoals>) => {
  const response = await fetchWithAuth(
    `${process.env.EXPO_PUBLIC_API_URL}/goals/dailyGoals/${userId}`,
    {
      method: "PUT",
      body: JSON.stringify(goals),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update daily goals");
  }

  const data = await response.json();
  Toast.show({
    type: "success",
    text1: "Goals Updated",
    text2: "Daily goals updated successfully",
  });
  return data.createDailyGoals;
};
