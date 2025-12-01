import { i18n } from "@/lib/i18next";
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
            title: `${i18n.t('buttons.home')}`,
            tabBarIcon: getTabBarIcon("home-outline"),
            tabBarLabel: `${i18n.t('buttons.home')}`,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: `${i18n.t('buttons.chat')}`,
            tabBarIcon: getTabBarIcon("chatbubble-ellipses"),
            tabBarLabel: `${i18n.t('buttons.chat')}`,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: `${i18n.t('buttons.progress')}`,
            tabBarIcon: getTabBarIcon("analytics-outline"),
            tabBarLabel: `${i18n.t('buttons.progress')}`,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: `${i18n.t('buttons.settings')}`,
            tabBarIcon: getTabBarIcon("settings-outline"),
            tabBarLabel: `${i18n.t('buttons.settings')}`,
            headerShown: false,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
