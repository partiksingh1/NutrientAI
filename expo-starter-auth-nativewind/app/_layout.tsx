import 'react-native-reanimated';
import { Stack, useSegments, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useCallback } from "react";
import { Text, View } from "react-native";
import ToastManager from "toastify-react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";
import "../global.css";

function AuthRoot() {
  const { isAuthenticated, isLoading, isProfileComplete } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const toastConfig = {
    success: (props: any) => (
      <View style={{ backgroundColor: '#4CAF50', padding: 16, borderRadius: 10 }}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>{props.text1}</Text>
        {props.text2 && <Text style={{ color: 'white' }}>{props.text2}</Text>}
      </View>
    ),
    // Override other toast types as needed
  }
  const handleNavigation = useCallback(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "auth";
    const inOnboarding = segments[0] === "OnBoarding";

    // 1️⃣ User not logged in → Go to login
    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace("/auth/login");
      }
      return;
    }

    // 2️⃣ User logged in but profile incomplete → Go to onboarding
    if (isAuthenticated && !isProfileComplete) {
      if (!inOnboarding) {
        router.replace("/OnBoarding/onboarding");
      }
      return;
    }

    // 3️⃣ User logged in and profile complete → Go to main app
    if (isAuthenticated && isProfileComplete) {
      if (inAuthGroup || inOnboarding) {
        router.replace("/(app)");
      }
    }
  }, [isAuthenticated, isLoading, isProfileComplete, segments]);

  useEffect(() => {
    handleNavigation();
  }, [handleNavigation]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600 mt-4">Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#4338ca",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="OnBoarding" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ title: "Login", headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ title: "Create Account", headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthRoot />
      <ToastManager useModal={true} />
    </AuthProvider>
  );
}