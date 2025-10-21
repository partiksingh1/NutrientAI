import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
/**
 * This is the layout for the authenticated app with tab navigation
 */
export default function AppLayout() {
  const getTabBarIcon = (name: keyof typeof Ionicons.glyphMap) => {
    return ({ color, size }: { color: string; size: number }) => (
      <Ionicons name={name} size={size} color={color} />
    );
  };

  return (
    <SafeAreaView edges={{
      top: "maximum"
    }} style={{ flex: 1, backgroundColor: "#f9fafb", margin: 0, padding: 0 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "green",
          tabBarInactiveTintColor: "#6b7280", // gray-500
          tabBarStyle: {
            backgroundColor: "#ffffff",
          },
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: "500",
            margin: 0
          },
          headerStyle: {
            backgroundColor: "#4338ca", // indigo-700
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: getTabBarIcon("home-outline"),
            tabBarLabel: "Home",
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: "Chat",
            tabBarIcon: getTabBarIcon("chatbubble-ellipses"),
            tabBarLabel: "AI Chat",
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: "Progress",
            tabBarIcon: getTabBarIcon("analytics-outline"),
            tabBarLabel: "Progress",
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: getTabBarIcon("settings-outline"),
            tabBarLabel: "Settings",
            headerShown: false,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
