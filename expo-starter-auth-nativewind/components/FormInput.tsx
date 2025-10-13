import React from "react";
import { TextInput, Text, View, TextInputProps } from "react-native";

interface FormInputProps extends TextInputProps {
    label: string;
    error?: string;
}

export default function FormInput({ label, error, ...props }: FormInputProps) {
    return (
        <View className="mb-5">
            <Text className="mb-2 text-gray-700 font-medium">{label}</Text>
            <TextInput
                className={`p-4 border rounded-md text-sm ${error ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"
                    }`}
                placeholderTextColor="#9CA3AF"
                {...props}
            />
            {error && <Text className="mt-1 text-red-500 text-sm">{error}</Text>}
        </View>
    );
}
