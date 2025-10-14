import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";

import RegisterForm from "../../components/RegisterForm";
import { useAuth } from "../../context/AuthContext";
import { RegisterCredentials } from "../../types/user";

export default function RegisterScreen() {
  const [error, setError] = useState<string | null>(null);
  const { register, isLoading } = useAuth();

  const handleRegister = async (credentials: RegisterCredentials) => {
    try {
      setError(null);
      await register(credentials);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // Adjust as needed
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center items-center px-6 py-10 bg-white">
          <View className="w-full max-w-sm">
            <View className="items-center mb-8">
              <Text className="text-3xl font-bold mb-1 text-center">Create Account</Text>
              <Text className="text-gray-600 mb-4 text-center">Sign up to get started</Text>
            </View>

            {error && (
              <View className="bg-red-100 border border-red-400 p-3 rounded-md mb-4">
                <Text className="text-red-700 font-medium text-sm">{error}</Text>
              </View>
            )}

            <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />

            <View className="mt-16 flex-row justify-center">
              <Text className="text-gray-600">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace("/auth/login")}>
                <Text className="text-indigo-700 font-bold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
