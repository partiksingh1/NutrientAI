import { Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import Button from "./Button";
import { LoginCredentials } from "../types/user";

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  isLoading?: boolean;
}

export default function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        await onSubmit({ email, password });
      } catch (error) {
        throw error;
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="w-full p-4"
    >
      <View className="mb-4">
        <Text className="mb-2 text-gray-700 font-medium">Email</Text>
        <TextInput
          className={`p-4 border rounded-lg ${errors.email ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          onFocus={() => setErrors({ ...errors, email: undefined })}
        />
        {errors.email && <Text className="mt-1 text-red-500 text-sm">{errors.email}</Text>}
      </View>

      <View className="mb-6">
        <Text className="mb-2 text-gray-700 font-medium">Password</Text>
        <View className="relative">
          <TextInput
            className={`p-4 border rounded-lg pr-12 ${errors.password ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            secureTextEntry={!showPassword}
            autoComplete="password"
            onFocus={() => setErrors({ ...errors, password: undefined })}
          />
          <TouchableOpacity
            className="absolute right-3 top-4"
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color="#6b7280" />
            ) : (
              <Eye size={20} color="#6b7280" />
            )}
          </TouchableOpacity>
        </View>
        {errors.password && <Text className="mt-1 text-red-500 text-sm">{errors.password}</Text>}
      </View>

      <TouchableOpacity
        className="mb-6 self-end"
        onPress={() =>
          Alert.alert(
            "Reset Password",
            "This feature would redirect to a password reset flow in a real app.",
          )
        }
      >
        <Text className="text-blue-600 font-medium">Forgot password?</Text>
      </TouchableOpacity>

      <Button
        label={isLoading ? "Signing in..." : "Sign In"}
        onPress={handleSubmit}
        disabled={isLoading}
        loading={isLoading}
        size="lg"
      />
    </KeyboardAvoidingView>
  );
}
