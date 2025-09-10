import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { ArrowLeft, Check, Edit3, ForkKnife, Send, Sparkles, Utensils } from 'lucide-react-native';
import axios from "axios"
type MealData = {
    customName: string;
    mealType: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    servings: number;
};

type Step = 'input' | 'confirm';

interface MealLoggingModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (mealData: MealData) => void;
}

const Separator = () => <View className="h-[1px] bg-gray-300 dark:bg-gray-700 my-2" />;


// ---------- MAIN COMPONENT ---------- //
export function MealLoggingModal({ open, onClose, onSave }: MealLoggingModalProps) {
    const [step, setStep] = useState<Step>('input');
    const [inputValue, setInputValue] = useState('');
    const [errorResponse, setErrorResponse] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [mealData, setMealData] = useState<MealData>({
        customName: '',
        mealType: 'breakfast',
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        servings: 1,
    });
    const [isEditing, setIsEditing] = useState(false);

    const handleClose = () => {
        setStep('input');
        setInputValue('');
        setMealData({
            customName: '',
            mealType: 'breakfast',
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            servings: 1,
        });
        setIsEditing(false);
        onClose();
    };
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;

    const handleProcessInput = async () => {
        if (!inputValue.trim()) return;
        setIsProcessing(true);
        try {
            const response = await axios.post(`${apiUrl}/meals/ai`, {
                userId: 2,
                message: inputValue
            })
            if (response.status == 201) {
                console.log("response is ", response);
                setMealData(response.data);
                setIsProcessing(false);
                setStep('confirm');
            } else if (response.status == 200) {
                setErrorResponse(response.data.question)
                setIsProcessing(false);
            }

        } catch (error) {

        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = async () => {
        console.log("Meal data is: ", mealData);
        setIsProcessing(true)
        try {
            const response = await axios.post(`${apiUrl}/meals`, mealData)
            if (response.status == 201) {
                onSave(mealData);
                handleClose();
            }
        } catch (error) {
            console.log(error);
        }
        finally {
            setIsProcessing(false)
        }
    };

    const renderInputStep = () => (
        <View className="space-y-6">
            <View className="items-center">
                <View className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <ForkKnife size={24} color="#3b82f6" />
                </View>
                <Text className="text-lg font-semibold">Describe Your Meal</Text>
                <Text className="text-gray-500 text-xs text-center mb-2">
                    Tell me what you ate and I'll calculate the nutrition for you
                </Text>
            </View>

            <View className="space-y-4">
                <View className="bg-gray-100 p-4 rounded-lg">
                    <Text className="text-gray-500 text-sm mb-2">Examples:</Text>
                    <Text className="text-sm">"Greek yogurt with berries"</Text>
                    <Text className="text-sm">"2 scrambled eggs with toast"</Text>
                    <Text className="text-sm">"Chicken caesar salad for lunch"</Text>
                </View>

                <View className='my-2'>
                    <Text className="text-sm mb-1">What did you eat?</Text>
                    <View className="flex-row gap-2">
                        <TextInput
                            className="flex-1 border border-gray-300 rounded-lg p-3"
                            placeholder="Describe your meal..."
                            value={inputValue}
                            onChangeText={setInputValue}
                            onSubmitEditing={handleProcessInput}
                        />
                        <TouchableOpacity
                            className="bg-blue-500 px-4 py-3 rounded-lg items-center justify-center"
                            disabled={!inputValue.trim() || isProcessing}
                            onPress={handleProcessInput}
                        >
                            {isProcessing ? <ActivityIndicator color="white" /> : <Send size={18} color="white" />}
                        </TouchableOpacity>
                    </View>
                </View>
                {errorResponse !== '' && (
                    <View className="bg-red-600 rounded-md mt-2">
                        <Text className="p-2 text-white text-center">{errorResponse}</Text>
                    </View>
                )}
            </View>
        </View>
    );

    const renderConfirmStep = () => (
        <ScrollView className="space-y-6">
            {/* Top buttons */}
            <View className="flex-row justify-between">
                <TouchableOpacity
                    className="flex-row items-center"
                    onPress={() => setStep("input")}
                >
                    <ArrowLeft size={16} color="#000" />
                    <Text className="ml-1">Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="flex-row items-center"
                    onPress={() => setIsEditing(!isEditing)}
                >
                    <Edit3 size={16} color="#000" />
                    <Text className="ml-1">{isEditing ? "Done" : "Edit"}</Text>
                </TouchableOpacity>
            </View>

            {/* Header */}
            <View className="items-center">
                <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-2">
                    <Utensils size={24} color="#16a34a" />
                </View>
                <Text className="text-lg font-semibold mb-1">Meal Analyzed!</Text>
                <Text className="text-gray-500 text-sm mb-3">Please review and confirm</Text>
            </View>

            {/* Card */}
            <View className="border border-gray-300 rounded-xl bg-white p-4">
                <View className="space-y-4">
                    {/* Meal Name */}
                    <View>
                        <Text className="font-medium mb-1">Meal Name</Text>
                        {isEditing ? (
                            <TextInput
                                className="border border-gray-300 rounded-lg p-3"
                                value={mealData.customName}
                                onChangeText={(text) =>
                                    setMealData((p) => ({ ...p, customName: text }))
                                }
                            />
                        ) : (
                            <Text className="text-lg">{mealData.customName}</Text>
                        )}
                    </View>

                    {/* Divider */}
                    <View className="h-[1px] bg-gray-200" />

                    {/* Meal Type + Servings */}
                    <View className="flex-row justify-between">
                        <View>
                            <Text className="font-medium mb-1">Meal Type</Text>
                            {isEditing ? (
                                <TextInput
                                    className="border border-gray-300 rounded-lg p-2 w-28"
                                    value={mealData.mealType}
                                    onChangeText={(value) =>
                                        setMealData((p) => ({ ...p, mealType: value }))
                                    }
                                />
                            ) : (
                                <Text className="capitalize">{mealData.mealType}</Text>
                            )}
                        </View>
                        <View>
                            <Text className="font-medium mb-1">Servings</Text>
                            {isEditing ? (
                                <TextInput
                                    className="border border-gray-300 rounded-lg p-2 w-20 text-center"
                                    keyboardType="numeric"
                                    value={mealData.servings.toString()}
                                    onChangeText={(value) =>
                                        setMealData((p) => ({
                                            ...p,
                                            servings: parseFloat(value) || 1,
                                        }))
                                    }
                                />
                            ) : (
                                <Text className="text-center">{mealData.servings}</Text>
                            )}
                        </View>
                    </View>

                    {/* Divider */}
                    <View className="h-[1px] bg-gray-200" />

                    {/* Nutrition */}
                    <View>
                        <Text className="text-center text-gray-500 text-sm mb-2">
                            Nutritional Information
                        </Text>
                        <View className="flex-row flex-wrap justify-between">
                            <View className="items-center w-1/2 mb-4">
                                <Text className="text-2xl text-blue-600">{mealData.calories}</Text>
                                <Text className="text-xs text-gray-500">Calories</Text>
                            </View>
                            <View className="items-center w-1/2 mb-4">
                                <Text className="text-2xl text-green-600">{mealData.protein}g</Text>
                                <Text className="text-xs text-gray-500">Protein</Text>
                            </View>
                            <View className="items-center w-1/2 mb-4">
                                <Text className="text-2xl text-orange-600">{mealData.carbs}g</Text>
                                <Text className="text-xs text-gray-500">Carbs</Text>
                            </View>
                            <View className="items-center w-1/2 mb-4">
                                <Text className="text-2xl text-purple-600">{mealData.fats}g</Text>
                                <Text className="text-xs text-gray-500">Fats</Text>
                            </View>
                        </View>

                        {/* Editable Macros */}
                        {isEditing && (
                            <View className="flex-row flex-wrap gap-3 pt-2">
                                <View className="w-[48%]">
                                    <Text className="text-sm mb-1">Calories</Text>
                                    <TextInput
                                        className="border border-gray-300 rounded-lg p-2"
                                        keyboardType="numeric"
                                        value={mealData.calories.toString()}
                                        onChangeText={(value) =>
                                            setMealData((p) => ({
                                                ...p,
                                                calories: parseInt(value) || 0,
                                            }))
                                        }
                                    />
                                </View>
                                <View className="w-[48%]">
                                    <Text className="text-sm mb-1">Protein (g)</Text>
                                    <TextInput
                                        className="border border-gray-300 rounded-lg p-2"
                                        keyboardType="numeric"
                                        value={mealData.protein.toString()}
                                        onChangeText={(value) =>
                                            setMealData((p) => ({
                                                ...p,
                                                protein: parseInt(value) || 0,
                                            }))
                                        }
                                    />
                                </View>
                                <View className="w-[48%]">
                                    <Text className="text-sm mb-1">Carbs (g)</Text>
                                    <TextInput
                                        className="border border-gray-300 rounded-lg p-2"
                                        keyboardType="numeric"
                                        value={mealData.carbs.toString()}
                                        onChangeText={(value) =>
                                            setMealData((p) => ({
                                                ...p,
                                                carbs: parseInt(value) || 0,
                                            }))
                                        }
                                    />
                                </View>
                                <View className="w-[48%]">
                                    <Text className="text-sm mb-1">Fats (g)</Text>
                                    <TextInput
                                        className="border border-gray-300 rounded-lg p-2"
                                        keyboardType="numeric"
                                        value={mealData.fats.toString()}
                                        onChangeText={(value) =>
                                            setMealData((p) => ({
                                                ...p,
                                                fats: parseInt(value) || 0,
                                            }))
                                        }
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Bottom buttons */}
            <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                    className="flex-1 border border-gray-300 py-3 rounded-lg items-center"
                    onPress={() => setStep("input")}
                >
                    <Text>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`flex-1 flex-row justify-center items-center py-3 rounded-lg ${isProcessing ? "bg-gray-400" : "bg-green-500"
                        }`}
                    onPress={handleSave}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="white" className="mr-2" />
                    ) : (
                        <Check size={16} color="white" />
                    )}
                    <Text className="text-white ml-2">
                        {isProcessing ? "Saving..." : "Save Meal"}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );


    return (
        <Modal visible={open} transparent animationType="slide" onRequestClose={handleClose}>
            <View className="flex-1 bg-black/40 justify-center px-4">
                <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-h-[85%]">
                    <Text className="text-lg font-bold flex-row items-center mb-4">
                        Log Your Meal
                    </Text>
                    <ScrollView>{step === 'input' ? renderInputStep() : renderConfirmStep()}</ScrollView>
                </View>
            </View>
        </Modal>
    );
}
