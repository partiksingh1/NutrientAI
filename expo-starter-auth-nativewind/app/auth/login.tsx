import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Toast } from "toastify-react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { AntDesign } from "@expo/vector-icons";

import LoginForm from "../../components/LoginForm";
import { useAuth } from "../../context/AuthContext";
import { LoginCredentials } from "../../types/user";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading, loginWithToken } = useAuth();

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    redirectUri: "com.partiksingh.expostarterauthnativewind:/",
    scopes: ["openid", "profile", "email"],
  });

  useEffect(() => {
    const loginWithGoogle = async (idToken: string) => {
      try {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: idToken }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Google login failed");

        await loginWithToken({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        });

        router.replace("/");
      } catch (err) {
        console.error("Google Login Error:", err);
        Alert.alert("Error", "Google Sign-In failed. Please try again.");
      }
    };

    if (response?.type === "success" && response.authentication?.idToken) {
      loginWithGoogle(response.authentication.idToken);
    } else if (response?.type === "error") {
      Alert.alert("Error", "Google Sign-In failed.");
    }
  }, [response]);

  const handleGoogleSignIn = () => {
    promptAsync();
  };

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      setError(null);
      await login(credentials);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Login Error",
        text2: `${err}`,
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
      });
      setError(err instanceof Error ? err.message : "Failed to login");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View className="flex-1 justify-center items-center px-6 py-10 bg-white">
        <View className="w-full max-w-sm">
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold mb-1 text-center">Welcome Back</Text>
            <Text className="text-gray-600 mb-6 text-center">
              Sign in to continue to your account
            </Text>
          </View>

          {error && (
            <View className="bg-red-100 border border-red-400 p-3 rounded-md mb-4">
              <Text className="text-red-700 font-medium text-sm">{error}</Text>
            </View>
          )}

          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

          <TouchableOpacity
            onPress={handleGoogleSignIn}
            className="flex-row items-center justify-center mt-4 bg-white border border-gray-300 rounded-md py-3 px-4 shadow-sm"
            activeOpacity={0.8}
          >
            <AntDesign name="google" size={20} color="#DB4437" style={{ marginRight: 10 }} />
            <Text className="text-gray-800 text-base font-medium">Continue with Google</Text>
          </TouchableOpacity>

          <View className="mt-6 flex-row justify-center">
            <Text className="text-gray-600">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/auth/register")}>
              <Text className="text-indigo-700 font-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
