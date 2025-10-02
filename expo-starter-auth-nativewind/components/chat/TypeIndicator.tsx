import { View, Text, ActivityIndicator } from 'react-native';

export default function TypingIndicator() {
    return (
        <View className="items-start">
            <View className="bg-gray-200 dark:bg-neutral-800 p-3 rounded-2xl flex-row items-center space-x-2">
                <ActivityIndicator size="small" color="#6B7280" />
                <Text className="text-gray-500 text-sm">AI is thinking...</Text>
            </View>
        </View>
    );
}
