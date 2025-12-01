import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Text,
  Keyboard,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

import Button from "./Button";
import FormInput from "./FormInput";
import { LoginCredentials } from "../types/user";
import { router } from "expo-router";
import { i18n } from "@/lib/i18next";

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
      newErrors.email = `${i18n.t("auth.login.errors.emailRequired")}`;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = `${i18n.t("auth.login.errors.emailInvalid")}`;
    }

    if (!password) {
      newErrors.password = `${i18n.t("auth.login.errors.passwordRequired")}`;
    } else if (password.length < 6) {
      newErrors.password = `${i18n.t("auth.login.errors.passwordMin")}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
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
        label={i18n.t("auth.login.email")}
        placeholder={i18n.t("auth.login.emailPlaceholder")}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        onFocus={() => setErrors({ ...errors, email: undefined })}
        error={errors.email}
      />

      <View className="mb-2">
        <FormInput
          label={i18n.t("auth.login.password")}
          placeholder={i18n.t("auth.login.passwordPlaceholder")}
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
        <Text className="text-blue-600 font-medium text-sm">{i18n.t("auth.login.forgotPassword")}</Text>
      </TouchableOpacity>

      <Button
        label={i18n.t("auth.login.signIn")}
        onPress={handleSubmit}
        disabled={isLoading}
        loading={isLoading}
        size="lg"
      />
    </KeyboardAvoidingView>
  );
}
