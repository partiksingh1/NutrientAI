import React from "react";
import { View, Text } from "react-native";
import { Sparkles } from "lucide-react-native";
import { i18n } from "@/lib/i18next";

const EmptyState = () => (
    <View className="flex-1 justify-center items-center p-8">
        <View className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full items-center justify-center mb-4">
            <Sparkles size={32} color="green" />
        </View>
        <Text className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {i18n.t("emptyState.welcomeTitle")}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
            {i18n.t("emptyState.welcomeSubtitle")}
        </Text>
        <Text className="text-sm text-gray-400 text-center">
            {i18n.t("emptyState.suggestions")}
        </Text>
    </View>
);

export default EmptyState;
