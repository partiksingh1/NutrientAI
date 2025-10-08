import React from "react";
import { View, Text, ActivityIndicator } from "react-native";

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

export default function LoadingScreen({ message = "Loading...", subMessage }: LoadingScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <View className="items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 dark:text-gray-300 mt-4 text-lg font-medium">{message}</Text>
        {subMessage && (
          <Text className="text-gray-500 dark:text-gray-400 mt-2 text-sm text-center">
            {subMessage}
          </Text>
        )}
      </View>
    </View>
  );
}
