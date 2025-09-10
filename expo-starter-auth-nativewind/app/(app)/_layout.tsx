import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <SafeAreaView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#4338ca", // indigo-700
          tabBarInactiveTintColor: "#6b7280", // gray-500
          tabBarStyle: {
            paddingVertical: 5,
            backgroundColor: "#ffffff",
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb", // gray-200
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
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
            headerShown: false
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: getTabBarIcon("person-outline"),
            tabBarLabel: "Profile",
            headerShown: false
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: getTabBarIcon("settings-outline"),
            tabBarLabel: "Settings",
            headerShown: false
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: "Progress",
            tabBarIcon: getTabBarIcon("analytics-outline"),
            tabBarLabel: "Progress",
            headerShown: false
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
