import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Alert } from "react-native";

import AuthService from "../services/authService";
import { AuthState, LoginCredentials, RegisterCredentials } from "../types/user";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  isProfileComplete: boolean;
  completeProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isProfileComplete: false,
  login: async () => { },
  register: async () => { },
  logout: async () => { },
  clearError: () => { },
  completeProfile: async () => { },
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    isProfileComplete: false,
  });

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const isAuthenticated = await AuthService.isAuthenticated();
        if (isAuthenticated) {
          const user = await AuthService.getCurrentUser();
          const profileCompleted = user?.profile_completed ?? false;
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            isProfileComplete: profileCompleted,
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isProfileComplete: false,
          });
        }
      } catch {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Failed to restore authentication state",
          isProfileComplete: false,
        });
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setState({ ...state, isLoading: true, error: null });

      const user = await AuthService.login(credentials);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isProfileComplete: user.profile_completed ?? false,
      });
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : "Login failed",
      });
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setState({ ...state, isLoading: true, error: null });

      const user = await AuthService.register(credentials);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isProfileComplete: user.profile_completed ?? false,
      });
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : "Registration failed",
      });
      throw error;
    }
  };
  const completeProfile = async () => {
    await AuthService.markProfileComplete();
    setState(prev => ({
      ...prev,
      isProfileComplete: true,
      user: prev.user ? { ...prev.user, profile_completed: true } : prev.user,
    }));
  };


  const logout = async () => {
    try {
      setState({ ...state, isLoading: true, error: null });

      await AuthService.logout();

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isProfileComplete: false,
      });
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : "Logout failed",
      });
      Alert.alert("Logout Error", "Failed to log out. Please try again.");
    }
  };

  const clearError = () => {
    setState({ ...state, error: null });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    completeProfile,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default AuthContext;
