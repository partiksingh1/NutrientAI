import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { Toast } from "toastify-react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { AntDesign } from "@expo/vector-icons";

import LoginForm from "../../components/LoginForm";
import { useAuth } from "../../context/AuthContext";
import { LoginCredentials } from "../../types/user";
import { i18n } from "@/lib/i18next";
import { Globe } from "lucide-react-native";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { login, isLoading, loginWithToken, language, setLanguage } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    redirectUri: "com.partiksingh.balancedbite:/",
    scopes: ["openid", "profile", "email"],
  });

  useEffect(() => {
    const loginWithGoogle = async (idToken: string) => {
      setIsGoogleLoading(true);
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
      } catch (err) {
        console.error("Google Login Error:", err);
      } finally {
        setIsGoogleLoading(false);
      }
    };

    if (response?.type === "success" && response.authentication?.idToken) {
      loginWithGoogle(response.authentication.idToken);
    } else if (response?.type === "error") {
      console.error(response.error);
    }
  }, [response]);

  const handleGoogleSignIn = () => {
    if (!isGoogleLoading) {
      promptAsync();
    }
  };

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      await login(credentials);
    } catch (err) {
      console.log("errrrrr is", err);

      Toast.show({
        type: "error",
        text1: String(err),
        // text2: String(err),
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
      });
      console.log("error is ", err);
    }
  };

  const toggleLanguage = () => {
    // Switch between "en" and "it"
    const newLang = language === "en" ? "it" : "en";
    setLanguage(newLang);
    i18n.locale = newLang;
  };
  const { width } = useWindowDimensions();

  return (
    <KeyboardAvoidingView
      behavior={"height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={0}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-evenly items-center px-6 py-10 bg-white">
          <View className="w-full max-w-sm">
            <View className="flex-col items-center">
              <Image
                source={require("../../assets/icon.png")}
                accessibilityLabel="BalancedBite logo"
                style={{
                  width: Math.min(120, width * 1),
                  height: Math.min(120, width * 1),
                  resizeMode: "contain",
                  marginBottom: 18,
                  borderRadius: 25
                }}
              />
              <Text className="text-gray-600 mb-6 text-center">
                {i18n.t("auth.login.subtitle")}
              </Text>
            </View>
            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
            <TouchableOpacity
              onPress={handleGoogleSignIn}
              className="flex-row items-center justify-center mt-4 bg-white border border-gray-300 rounded-md py-3 px-4 shadow-sm"
              activeOpacity={0.8}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <AntDesign name="google" size={20} color="black" style={{ marginRight: 10 }} />
                  <Text className="text-gray-800 text-base font-medium">{i18n.t("auth.login.continueWithGoogle")}</Text>
                </>
              )}
            </TouchableOpacity>
            <View className="mt-6 flex-row justify-center">
              <Text className="text-gray-600">{i18n.t("auth.login.dontHaveAccount")} </Text>
              <TouchableOpacity onPress={() => router.replace("/auth/register")}>
                <Text className="text-indigo-700 font-bold">{i18n.t("auth.login.signUp")}</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* LANGUAGE SWITCHER BUTTON */}
          <View className="flex-row justify-center mb-4">
            <TouchableOpacity
              onPress={toggleLanguage}
              activeOpacity={0.8}
              className="flex-row items-center justify-center bg-gray-100 border border-gray-300 px-4 py-2 rounded-lg"
            >
              <Globe size={18} color="#4B5563" strokeWidth={1.7} />

              <Text className="ml-2 text-gray-800 font-medium text-base">
                {language === "en" ? "Change the language" : "Cambia il linguaggio"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}