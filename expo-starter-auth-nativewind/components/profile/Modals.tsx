// components/Modals.tsx
import React from "react";
import { View, Text, TouchableOpacity, Modal, FlatList } from "react-native";
import { X } from "lucide-react-native";

type DietOption = { value: string; label: string };
type MealOption = { value: number; label: string };

export function DietTypeModal({
    visible,
    onClose,
    onSelect,
    options,
}: {
    visible: boolean;
    onClose: () => void;
    onSelect: (value: string) => void;
    options: DietOption[];
}) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl p-6 max-h-96">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-semibold">Select Diet Type</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="gray" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={options}
                        keyExtractor={(i) => i.value}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => onSelect(item.value)}
                                className="py-3 px-4 border-b border-gray-100"
                            >
                                <Text className="text-base">{item.label}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
}

export function MealFrequencyModal({
    visible,
    onClose,
    onSelect,
    options,
}: {
    visible: boolean;
    onClose: () => void;
    onSelect: (value: number) => void;
    options: MealOption[];
}) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl p-6 max-h-96">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-semibold">Select Meal Frequency</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="gray" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={options}
                        keyExtractor={(i) => i.value.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => onSelect(item.value)}
                                className="py-3 px-4 border-b border-gray-100"
                            >
                                <Text className="text-base">{item.label}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
}
