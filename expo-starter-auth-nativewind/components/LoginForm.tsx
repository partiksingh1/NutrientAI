import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Text,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

import Button from "./Button";
import FormInput from "./FormInput";
import { LoginCredentials } from "../types/user";
import { router } from "expo-router";

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
      className="w-full"
    >
      <FormInput
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        onFocus={() => setErrors({ ...errors, email: undefined })}
        error={errors.email}
      />

      <View className="mb-6">
        <FormInput
          label="Password"
          placeholder="Your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          textContentType="password"
          autoCapitalize="none"
          autoComplete="password"
          onFocus={() => setErrors({ ...errors, password: undefined })}
          error={errors.password}
        />
        <TouchableOpacity
          className="absolute right-4 top-[40px]"
          onPress={() => setShowPassword(!showPassword)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="mb-6 self-end"
        onPress={() => router.push("/auth/reset-password")}
      >
        <Text className="text-blue-600 font-medium text-sm">Forgot password?</Text>
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
