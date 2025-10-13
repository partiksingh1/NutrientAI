// src/components/MacroRing.tsx
import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";

export const MacroRing = ({
    label,
    current,
    target,
    color,
}: {
    label: string;
    current: number;
    target?: number;
    color: string;
}) => {
    const percentage = target ? (current / target) * 100 : 0;
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = target
        ? circumference - (percentage / 100) * circumference
        : circumference;

    return (
        <View className="items-center">
            <View className="relative w-full p-2 h-20">
                <Svg width="80" height="80" style={{ transform: [{ rotate: "-90deg" }] }}>
                    <Circle cx="40" cy="40" r={radius} stroke="#e5e7eb" strokeWidth="6" fill="none" />
                    <Circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke={color}
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                    />
                </Svg>
                <View className="absolute inset-0 items-center justify-center mt-4">
                    <Text className="text-xs">{current}</Text>
                    <Text className="text-xs text-gray-500">/ {target ?? "--"}</Text>
                </View>
            </View>
            <Text className="text-xs mt-4">{label}</Text>
        </View>
    );
};

export const ProgressBar = ({ value }: { value: number }) => (
    <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <View className="h-2 bg-green-500" style={{ width: `${value}%` }} />
    </View>
);