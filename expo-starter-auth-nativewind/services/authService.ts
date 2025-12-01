import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "toastify-react-native";

import { User, LoginCredentials } from "../types/user";
import { i18n } from "@/lib/i18next";

const AUTH_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_DATA_KEY = "user_data";
export default class AuthService {
  /**
   * Login with email and password
   */
  static async login(credentials: LoginCredentials): Promise<User> {
    try {
      console.log("response is called ");
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      console.log("response s is ", response);

      if (response.status == 404) {
        const errorData = await response.json();
        console.log("errorData is ", errorData);

        throw new Error(i18n.t("toast.loginFailed.title1"));
      }
      if (response.status == 401) {
        const errorData = await response.json();
        console.log("errorData is ", errorData);

        throw new Error(i18n.t("toast.loginFailed.title2"));
      }
      if (response.status == 500) {
        const errorData = await response.json();
        console.log("errorData is ", errorData);

        throw new Error(i18n.t("toast.loginFailed.title2"));
      }

      const { accessToken, refreshToken, user } = await response.json();
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);

      await AsyncStorage.multiSet([
        [AUTH_TOKEN_KEY, accessToken],
        [REFRESH_TOKEN_KEY, refreshToken],
        [USER_DATA_KEY, JSON.stringify(user)],
      ]);

      Toast.show({
        type: "success",
        text1: i18n.t("toast.loginSuccess.title"),
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
      });

      return {
        id: String(user.id),
        email: user.email,
        username: user.username,
        profile_completed: user.profile_completed,
      };
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Something went wrong during login");
    }
  }
  static async saveTokens({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY]);
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error("Failed to save tokens:", error);
      throw error;
    }
  }

  static async setCurrentUser(user: User) {
    try {
      await AsyncStorage.multiRemove([USER_DATA_KEY]);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Failed to save user data:", error);
      throw error;
    }
  }

  /**
   * Register a new user
   */
  static async register(userData: LoginCredentials & { name: string, language: string }): Promise<User> {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userData.name, // The backend expects "username"
          email: userData.email,
          password: userData.password,
          language: userData.language
        }),
      });

      if (response.status == 400) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      } else if (response.status != 201) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }
      const { accessToken, refreshToken, user } = await response.json();
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);

      await AsyncStorage.multiSet([
        [AUTH_TOKEN_KEY, accessToken],
        [REFRESH_TOKEN_KEY, refreshToken],
        [USER_DATA_KEY, JSON.stringify(user)],
      ]);

      return {
        id: String(user.id),
        email: user.email,
        username: user.username, // backend returns "username", so map to "name"
        profile_completed: user.profile_completed,
      };
    } catch (error: any) {
      console.error("Register error:", error);
      throw new Error(error.message || "Something went wrong during registration");
    }
  }

  /**
   * Logout the current user
   */
  static async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);

      Toast.show({
        type: "warn",
        text1: i18n.t("toast.logoutSuccess.title")
      });
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }
  /**
   * updates the current user profile to true
   */

  static async markProfileComplete(): Promise<void> {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!userData) return;

      const user = JSON.parse(userData);
      user.profile_completed = true;

      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Failed to mark profile as complete:", error);
    }
  }

  /**
   * Get the current user profile
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

      if (!token) {
        return null;
      }

      const userData = await AsyncStorage.getItem(USER_DATA_KEY);

      if (!userData) {
        return null;
      }

      return JSON.parse(userData) as User;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }

  /**
   * Check if the user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      return !!token;
    } catch (error) {
      console.error("Auth check error:", error);
      return false;
    }
  }

  static async forgotPassword(email: string): Promise<void> {
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.status == 404) {
      Toast.error(i18n.t("toast.noUserEmail.title"))
    }
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error?.error || "Failed to send OTP");
    }
  };

  static async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<void> {
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    });
    if (res.status == 400) {
      Toast.error(i18n.t("toast.invalidOtp.title"))
    }
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error?.error || "Reset failed");
    }
  };
}
