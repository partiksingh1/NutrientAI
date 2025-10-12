import React from "react";
import { Pressable, Text, View } from "react-native";

interface CustomCheckboxProps {
  value: boolean;
  onValueChange: (newValue: boolean) => void;
  label: string;
}

export const CustomCheckbox = ({ value, onValueChange, label }: CustomCheckboxProps) => {
  return (
    <Pressable onPress={() => onValueChange(!value)} className="flex-row items-center">
      <View
        className={`w-5 h-5 rounded-md border ${value ? "bg-green-600 border-green-500" : "bg-gray-100 border-gray-300"
          } items-center justify-center`}
      >
        {value && <Text className="text-white text-xs">✓</Text>}
      </View>
      <Text className="text-lg px-3">{label}</Text>
    </Pressable>
  );
};
