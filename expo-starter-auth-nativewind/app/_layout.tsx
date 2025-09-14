import 'react-native-reanimated';
import { Stack, useSegments, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useCallback, JSXElementConstructor, ReactElement, ReactNode, ReactPortal } from "react";
import { ActivityIndicatorComponent, Text, View } from "react-native";
import ToastManager, { Toast } from 'toastify-react-native'
import { AuthProvider, useAuth } from "../context/AuthContext";

import "../global.css";

function AuthRoot() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const handleNavigation = useCallback(() => {
    const inAuthGroup = segments[0] === "auth";
    const inOnboarding = segments[0] === "OnBoarding";

    if (isLoading) {
      return;
    }

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/auth/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/");
    }

    if (isAuthenticated) {
      if (!user?.profile_completed && !inOnboarding) {
        // If logged in but profile not complete, redirect to onboarding
        router.replace("/OnBoarding/onboarding");
        return;
      }

      if (user?.profile_completed && (inAuthGroup || inOnboarding)) {
        // If profile complete but in auth or onboarding group, redirect to main app
        router.replace("/(app)");
        return;
      }
    }
  }, [isAuthenticated, segments, isLoading]);

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
        <Stack.Screen
          name="(app)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OnBoarding"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="auth/login"
          options={{
            title: "Login",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="auth/register"
          options={{
            title: "Create Account",
            headerShown: false,
          }}
        />
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
