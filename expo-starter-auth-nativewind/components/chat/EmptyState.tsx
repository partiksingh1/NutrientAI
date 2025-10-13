import React from "react";
import { View, Text } from "react-native";
import { Sparkles } from "lucide-react-native";

const EmptyState = () => (
    <View className="flex-1 justify-center items-center p-8">
        <View className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full items-center justify-center mb-4">
            <Sparkles size={32} color="green" />
        </View>
        <Text className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Welcome to Nutrential!
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
            I'm your personal nutrition assistant. Ask me about meals, track your progress, or get
            personalized recommendations.
        </Text>
        <Text className="text-sm text-gray-400 text-center">
            Try one of the suggestions below to get started
        </Text>
    </View>
);

export default EmptyState;
