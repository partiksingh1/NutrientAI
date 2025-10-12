import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { Toast } from "toastify-react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();


import LoginForm from "../../components/LoginForm";
import { useAuth } from "../../context/AuthContext";
import { LoginCredentials } from "../../types/user";
import { makeRedirectUri } from "expo-auth-session";
export default function LoginScreen() {

  const [error, setError] = useState<string | null>(null);
  const { login, isLoading, loginWithToken } = useAuth();

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    redirectUri: "com.partiksingh.expostarterauthnativewind:/",
    scopes: [
      "openid",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });
  useEffect(() => {
    console.log("webClientId:", process.env.EXPO_PUBLIC_WEB_CLIENT_ID);
    console.log("androidClientId:", process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID);

    const loginWithGoogle = async (idToken: string) => {
      try {
        console.log("🔄 Attempting to log in with Google access token...");

        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: idToken }),
        });

        const data = await res.json();

        console.log("📡 Response from backend:", data);

        if (!res.ok) {
          console.error("❌ Server responded with error:", data.error || "Unknown error");
          throw new Error(data.error || 'Google login failed');
        }

        console.log("✅ Backend authentication successful. Saving tokens...");

        await loginWithToken({
          accessToken: data.accessToken as any,
          refreshToken: data.refreshToken,
          user: data.user,
        });

        console.log("🚀 Tokens saved. Redirecting to home page...");
        router.replace("/");
      } catch (err) {
        console.error("❗ Google Login Error:", err);
        Alert.alert("Error", "Google Sign-In failed. Please try again.");
      }
    };

    console.log("🧪 Google Sign-In response:", response); // 👈 Add this

    if (response?.type === "success") {
      const { authentication } = response;
      console.log("🎉 Google Sign-In success:", authentication);

      if (authentication?.idToken) {
        console.log("✅ Google ID Token received:", authentication.idToken);
        loginWithGoogle(authentication.idToken); // 👈 Pass the ID Token
      } else {
        console.warn("⚠️ No ID token found in authentication response. Check scopes.");
      }
    } else if (response?.type === "error") {
      console.error("❌ Google Sign-In error response:", response);
      Alert.alert("Error", "Google Sign-In failed.");
    } else if (response) {
      console.warn("⚠️ Unhandled Google Sign-In response type:", response?.type);
      console.log("ℹ️ Waiting for Google Sign-In response...");
    }
  }, [response]);




  const handleGoogleSignIn = () => {
    promptAsync();
    console.log("req is", request)
    console.log("res is", response)
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
      <View className="flex-1 justify-center items-center p-4 bg-white">
        <View className="w-full max-w-sm">
          {/* Logo placeholder - replace with your actual logo */}
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold mb-1 text-center">Welcome Back</Text>
            <Text className="text-gray-600 mb-8 text-center">
              Sign in to continue to your account
            </Text>
          </View>

          {error && (
            <View className="bg-red-100 p-3 rounded-md mb-4">
              <Text className="text-red-700">{error}</Text>
            </View>
          )}

          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

          <View className="mt-6 flex-row justify-center">
            <Text className="text-gray-600">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/register")}>
              <Text className="text-indigo-700 font-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleGoogleSignIn}>
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F2F4F7",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  button: {
    backgroundColor: "#4285F4",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "#FFF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderColor: "#4285F4",
    borderWidth: 2,
    width: "80%",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#4285F4",
    fontWeight: "bold",
    fontSize: 16,
  },
  statusBox: {
    marginTop: 20,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    color: "#333",
  },
  jsonBox: {
    marginTop: 10,
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    width: "100%",
  },
  jsonTitle: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 16,
    color: "#333",
  },
  jsonText: {
    fontSize: 14,
    color: "#000",
  },
});