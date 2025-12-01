import React, { useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

import Button from "./Button";
import FormInput from "./FormInput";
import { RegisterCredentials } from "../types/user";
import { i18n } from "@/lib/i18next";
import { useAuth } from "@/context/AuthContext";

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
  const { language } = useAuth();
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name) newErrors.name = `${i18n.t("auth.register.errors.nameRequired")}`;

    if (!email) {
      newErrors.email = `${i18n.t("auth.register.errors.emailRequired")}`;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = `${i18n.t("auth.register.errors.emailInvalid")}`;
    }

    if (!password) {
      newErrors.password = `${i18n.t("auth.register.errors.passwordRequired")}`;
    } else if (password.length < 6) {
      newErrors.password = `${i18n.t("auth.register.errors.passwordMin")}`;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = `${i18n.t("auth.register.errors.passwordMismatch")}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        await onSubmit({ name, email, password, language });
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
        label={i18n.t("auth.register.fullName")}
        placeholder={i18n.t("auth.register.fullNamePlaceholder")}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoComplete="name"
        onFocus={() => setErrors({ ...errors, name: undefined })}
        error={errors.name}
      />

      <FormInput
        label={i18n.t("auth.register.email")}
        placeholder={i18n.t("auth.register.emailPlaceholder")}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        onFocus={() => setErrors({ ...errors, email: undefined })}
        error={errors.email}
      />

      <View className="mb-5 relative">
        <FormInput
          label={i18n.t("auth.register.password")}
          placeholder={i18n.t("auth.register.passwordPlaceholder")}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete="new-password"
          onFocus={() => setErrors({ ...errors, password: undefined })}
          error={errors.password}
        />
        <TouchableOpacity
          className="absolute right-4 top-[40px]"
          onPress={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff size={20} color="#6b7280" />
          ) : (
            <Eye size={20} color="#6b7280" />
          )}
        </TouchableOpacity>
      </View>

      <View className="mb-6 relative">
        <FormInput
          label={i18n.t("auth.register.confirmPassword")}
          placeholder={i18n.t("auth.register.confirmPasswordPlaceholder")}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          autoComplete="new-password"
          onFocus={() => setErrors({ ...errors, confirmPassword: undefined })}
          error={errors.confirmPassword}
        />
        <TouchableOpacity
          className="absolute right-4 top-[40px]"
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? (
            <EyeOff size={20} color="#6b7280" />
          ) : (
            <Eye size={20} color="#6b7280" />
          )}
        </TouchableOpacity>
      </View>

      <Button
        label={isLoading ? `${i18n.t("auth.register.creatingAccount")}` : `${i18n.t("auth.register.createAccount")}`}
        onPress={handleSubmit}
        disabled={isLoading}
        loading={isLoading}
        size="lg"
      />
    </KeyboardAvoidingView>
  );
}
