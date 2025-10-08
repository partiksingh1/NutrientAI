import { Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";

import Button from "./Button";
import { RegisterCredentials } from "../types/user";

interface RegisterFormProps {
  onSubmit: (credentials: RegisterCredentials) => Promise<void>;
  isLoading?: boolean;
}

export default function RegisterForm({ onSubmit, isLoading = false }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name) {
      newErrors.name = "Name is required";
    }

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

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        await onSubmit({ name, email, password });
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
        <Text className="mb-2 text-gray-700 font-medium">Full Name</Text>
        <TextInput
          className={`p-4 border rounded-lg ${errors.name ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}
          value={name}
          onChangeText={setName}
          placeholder="Your full name"
          autoCapitalize="words"
          autoComplete="name"
          onFocus={() => setErrors({ ...errors, name: undefined })}
        />
        {errors.name && <Text className="mt-1 text-red-500 text-sm">{errors.name}</Text>}
      </View>

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

      <View className="mb-4">
        <Text className="mb-2 text-gray-700 font-medium">Password</Text>
        <View className="relative">
          <TextInput
            className={`p-4 border rounded-lg pr-12 ${errors.password ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            secureTextEntry={!showPassword}
            autoComplete="new-password"
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

      <View className="mb-6">
        <Text className="mb-2 text-gray-700 font-medium">Confirm Password</Text>
        <View className="relative">
          <TextInput
            className={`p-4 border rounded-lg pr-12 ${errors.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            secureTextEntry={!showConfirmPassword}
            autoComplete="new-password"
            onFocus={() => setErrors({ ...errors, confirmPassword: undefined })}
          />
          <TouchableOpacity
            className="absolute right-3 top-4"
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff size={20} color="#6b7280" />
            ) : (
              <Eye size={20} color="#6b7280" />
            )}
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && (
          <Text className="mt-1 text-red-500 text-sm">{errors.confirmPassword}</Text>
        )}
      </View>

      <Button
        label={isLoading ? "Creating account..." : "Create Account"}
        onPress={handleSubmit}
        disabled={isLoading}
        loading={isLoading}
        size="lg"
      />
    </KeyboardAvoidingView>
  );
}
