import "react-native-reanimated";
import { useEffect, useState } from "react";
import { Slot, useSegments, useRouter, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, ActivityIndicator, Modal } from "react-native";
import NetInfo from '@react-native-community/netinfo';
import ToastManager, { Toast } from "toastify-react-native";

import { AuthProvider, useAuth } from "../context/AuthContext";
import "../global.css";
import toastConfig from "@/utils/toastConfig";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => { });

function AuthGate() {
  const { isAuthenticated, isLoading, isProfileComplete } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [appIsReady, setAppIsReady] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // ✅ Listen to internet connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = !!(state.isConnected && state.isInternetReachable);
      setIsConnected(connected);

      if (!connected) {
        Toast.show({
          type: 'warn',
          text1: "No Internet Connection",
          text2: "Please check your internet connection to continue",
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // ✅ Handle authentication and onboarding routing
  useEffect(() => {
    if (isLoading) return; // Wait until auth finishes loading

    const inAuthGroup = segments[0] === "auth";
    const inOnboarding = segments[0] === "OnBoarding";

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace("/auth/login");
      }
    } else if (!isProfileComplete) {
      if (!inOnboarding) {
        router.replace("/OnBoarding/onboarding");
      }
    } else {
      if (inAuthGroup || inOnboarding) {
        router.replace("/(app)");
      }
    }

    setAppIsReady(true);
  }, [isLoading, isAuthenticated, isProfileComplete, segments]);

  // ✅ Hide splash once app is ready
  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [appIsReady]);

  // ✅ Block app usage if offline
  if (!isConnected) {
    return (
      <>
        <Modal transparent visible animationType="fade">
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}>
            <View style={{
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 24,
              alignItems: 'center',
              maxWidth: 300,
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                No Internet Connection
              </Text>
              <Text style={{ fontSize: 14, color: '#444', textAlign: 'center' }}>
                Please connect to the internet to continue using the app.
              </Text>
              <ActivityIndicator style={{ marginTop: 16 }} size="small" color="#3b82f6" />
            </View>
          </View>
        </Modal>
        <ToastManager config={toastConfig} />
      </>
    );
  }

  // ✅ Wait for app to be ready
  if (!appIsReady) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <>
      <Slot />
      <ToastManager config={toastConfig} />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AuthGate />
    </AuthProvider>
  );
}
