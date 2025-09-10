import AsyncStorage from "@react-native-async-storage/async-storage";

import { User, LoginCredentials } from "../types/user";

const AUTH_TOKEN_KEY = "auth_token";
const USER_DATA_KEY = "user_data";
export default class AuthService {
  /**
   * Login with email and password
   */
  static async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await fetch('http://192.168.1.68:3000/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      const { token, user } = data;

      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));

      return {
        id: String(user.id),
        email: user.email,
        username: user.username,
        profile_completed: user.profile_completed,
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Something went wrong during login');
    }
  }


  /**
   * Register a new user
   */
  static async register(userData: LoginCredentials & { name: string }): Promise<User> {
    try {
      const response = await fetch('http://192.168.1.68:3000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.name, // The backend expects "username"
          email: userData.email,
          password: userData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      const { token, user } = data;

      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));

      return {
        id: String(user.id),
        email: user.email,
        username: user.username, // backend returns "username", so map to "name"
        profile_completed: user.profile_completed,
      };
    } catch (error: any) {
      console.error('Register error:', error);
      throw new Error(error.message || 'Something went wrong during registration');
    }
  }


  /**
   * Logout the current user
   */
  static async logout(): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
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
}
