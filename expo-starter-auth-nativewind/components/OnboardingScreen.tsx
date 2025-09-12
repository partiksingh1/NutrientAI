import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { CustomCheckbox } from './CustomCheckbox';
import { Switch } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from '@react-native-community/datetimepicker';
import { User } from '@/types/user';
interface OnboardingScreenProps {
    onComplete: () => void;
}


export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await AsyncStorage.getItem('user_data');
                console.log("user data is ", userData);

                if (userData) {
                    const parsedUser: User = JSON.parse(userData);
                    setUser(parsedUser);
                }
            } catch (error) {
                console.error('Failed to load user data', error);
            }
        };

        loadUser();
    }, []);
    const [step, setStep] = useState(1);
    const [customAllergy, setCustomAllergy] = useState('');
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [formData, setFormData] = useState({
        age: '',
        weight: '',
        height: '',
        activityLevel: '',
        goal: '',
        goalDescription: '',
        goalEndDate: '',
        dietType: 'OMNIVORE', // default value from your enum
        allergies: [] as string[],
        mealFrequency: 3,
        snackIncluded: true
    });

    const totalSteps = 4;
    const progress = (step / totalSteps) * 100;

    const showDatePicker = () => {
        setIsDatePickerVisible(true);
    };

    const handleNext = async () => {
        if (step < totalSteps) {
            setStep(step + 1);
            return;
        }
        onComplete()
        try {
            const token = await AsyncStorage.getItem("auth_token")
            console.log("FormData is ", formData);

            const response = await fetch("http://192.168.162.155:3000/api/complete_profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // if using JWT auth
                },
                body: JSON.stringify({
                    height: parseFloat(formData.height),
                    weight: parseFloat(formData.weight),
                    age: parseInt(formData.age),
                    activityLevel: formData.activityLevel.toUpperCase(), // if required
                    mealFrequency: formData.mealFrequency,
                    snackIncluded: formData.snackIncluded,
                    dietType: formData.dietType,
                    allergies: formData.allergies.join(","),
                    dietaryGoals: [
                        {
                            type: formData.goal,
                            description: formData.goalDescription || null,
                            endDate: formData.goalEndDate || null
                        }
                    ]
                }),
            });

            const result = await response.json();

            if (response.ok) {
                console.log("✅ Profile saved:", result);
                onComplete();
            } else {
                console.error("❌ API Error:", result);
                alert(result.error || "Something went wrong!");
            }
        } catch (error) {
            console.error("❌ Network Error:", error);
            alert("Failed to submit. Please try again.");
        }
    };


    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleAllergyToggle = (allergy: string) => {
        setFormData(prev => {
            const current = prev.allergies || [];
            return {
                ...prev,
                allergies: current.includes(allergy)
                    ? current.filter(a => a !== allergy)
                    : [...current, allergy]
            };
        });
    };



    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <View className="my-6">
                        <View className="items-center">
                            <View className="w-20 h-20 bg-black rounded-full items-center justify-center mb-4">
                                <Sparkles color="white" size={32} />
                            </View>
                            <Text className="text-3xl font-bold mb-4">Hi {user?.username}</Text>
                            <Text className="text-xl font-bold mb-2">Welcome to NutriAI</Text>
                            <Text className="text-gray-500">Your personal AI nutritionist assistant</Text>
                        </View>

                        <View className="my-4">
                            {/* <View className="my-4">
                                <Text className="mb-2">What's your name?</Text>
                                <TextInput
                                    value={formData.name}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                                    placeholder="Enter your name"
                                    className="bg-gray-100 rounded-lg px-3 py-3"
                                />
                            </View> */}

                            <View className="flex-row space-x-4 gap-5 my-4">
                                <View className="flex-1">
                                    <Text className="mb-1">Age</Text>
                                    <TextInput
                                        value={formData.age}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, age: text }))}
                                        placeholder="25"
                                        keyboardType="numeric"
                                        className="bg-gray-100 rounded-lg px-3 py-3"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="mb-1">Weight (kg)</Text>
                                    <TextInput
                                        value={formData.weight}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, weight: text }))}
                                        placeholder="70"
                                        keyboardType="numeric"
                                        className="bg-gray-100 rounded-lg px-3 py-3"
                                    />
                                </View>
                            </View>

                            <View className='my-4'>
                                <Text className="mb-1">Height (cm)</Text>
                                <TextInput
                                    value={formData.height}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, height: text }))}
                                    placeholder="175"
                                    keyboardType="numeric"
                                    className="bg-gray-100 rounded-lg px-3 py-3"
                                />
                            </View>
                        </View>
                    </View>
                );

            case 2:
                return (
                    <View className="my-6">
                        <Text className="text-center text-3xl font-semibold mb-4">Activity Level</Text>
                        <Text className="text-center text-gray-500 mb-8">How active are you on a typical day?</Text>
                        {[
                            { value: 'Sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
                            { value: 'Light', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
                            { value: 'Moderate', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
                            { value: 'Very active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                onPress={() => setFormData(prev => ({ ...prev, activityLevel: option.value }))}
                                className={`my-3 p-4 border rounded-lg ${formData.activityLevel === option.value
                                    ? 'border-blue-500 bg-blue-100'
                                    : 'border-gray-300'
                                    }`}
                            >
                                <Text className="text-md font-medium">{option.label}</Text>
                                <Text className="text-base text-gray-500">{option.desc}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                );

            case 3:
                return (
                    <ScrollView className="my-6">
                        <Text className="text-center text-3xl font-semibold mb-4">Your Goals</Text>
                        <Text className="text-center text-gray-500 mb-8">What's your primary fitness goal?</Text>

                        {/* Goals Selection */}
                        <View className='flex-row flex-wrap justify-between'>
                            {[
                                { value: 'FAT_LOSS', label: 'Fat Loss', emoji: '🔥' },
                                { value: 'MUSCLE_GAIN', label: 'Muscle Gain', emoji: '💪' },
                                { value: 'MAINTENANCE', label: 'Maintain Weight', emoji: '⚖️' },
                                { value: 'GENERAL_HEALTH', label: 'General Health', emoji: '🌱' }
                            ].map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    onPress={() => setFormData(prev => ({ ...prev, goal: option.value }))}
                                    className={`w-[48%] p-4 border rounded-lg mb-4 ${formData.goal === option.value
                                        ? 'border-blue-500 bg-blue-100'
                                        : 'border-gray-300'
                                        }`}
                                >
                                    <View className='flex-row justify-center items-center'>
                                        <Text className="text-2xl mr-2">{option.emoji}</Text>
                                        <Text className="text-base">{option.label}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Goal Description */}
                        <View className="my-4">
                            <Text className="mb-1 font-medium">Why is this your goal?</Text>
                            <TextInput
                                value={formData.goalDescription}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, goalDescription: text }))}
                                placeholder="Describe your motivation or reason"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                className="bg-gray-100 rounded-lg px-3 py-3"
                            />
                        </View>

                        {/* Goal End Date Picker */}
                        <View className="my-4">
                            <Text className="mb-1 font-medium">Target End Date</Text>
                            <TouchableOpacity
                                onPress={showDatePicker}
                                className="bg-gray-100 rounded-lg px-3 py-3"
                            >
                                <Text className="text-gray-700">
                                    {formData.goalEndDate
                                        ? new Date(formData.goalEndDate).toLocaleDateString()
                                        : 'Select a date'}
                                </Text>
                            </TouchableOpacity>
                            {isDatePickerVisible && (
                                <DateTimePicker
                                    mode="date"
                                    value={formData.goalEndDate ? new Date(formData.goalEndDate) : new Date()}
                                    display="default"
                                    onChange={(event: any, selectedDate) => {
                                        setIsDatePickerVisible(false);

                                        if (selectedDate) {
                                            setFormData(prev => ({
                                                ...prev,
                                                goalEndDate: selectedDate.toISOString()
                                            }));
                                        }
                                    }}

                                />
                            )}
                        </View>
                    </ScrollView>
                );

            case 4:
                return (
                    <View className="my-6">
                        <Text className="text-center text-3xl font-semibold mb-4">Dietary Preferences</Text>
                        <Text className="text-center text-gray-500 mb-8">Tell us more about your eating habits</Text>

                        {/* Allergy selection */}
                        <View>
                            <Text className="mb-2 font-medium text-2xl text-center">Allergies</Text>

                            {/* Combined Allergy Grid */}
                            <View className="flex-row flex-wrap justify-between">
                                {[...['Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Eggs', 'Soy', 'Fish'],
                                ...formData.allergies.filter(
                                    (a) => !['Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Eggs', 'Soy', 'Fish'].includes(a)
                                )
                                ].map((allergy) => (
                                    <View key={allergy} className="w-[48%] mb-2">
                                        <CustomCheckbox
                                            value={formData.allergies.includes(allergy)}
                                            onValueChange={() => handleAllergyToggle(allergy)}
                                            label={allergy}
                                        />
                                    </View>
                                ))}
                            </View>

                            {/* Custom allergy input */}
                            <View className="flex-row items-center mt-4">
                                <TextInput
                                    value={customAllergy}
                                    onChangeText={setCustomAllergy}
                                    placeholder="Add custom allergy"
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 mr-4"
                                />
                                <TouchableOpacity
                                    onPress={() => {
                                        const trimmed = customAllergy.trim();
                                        if (trimmed && !formData.allergies.includes(trimmed)) {
                                            setFormData(prev => ({
                                                ...prev,
                                                allergies: [...prev.allergies, trimmed]
                                            }));
                                            setCustomAllergy('');
                                        }
                                    }}
                                    className="bg-red-600 px-4 py-2 rounded-lg"
                                >
                                    <Text className="text-white font-bold text-center">Add</Text>
                                </TouchableOpacity>
                            </View>
                        </View>


                        {/* Meal frequency input with increment/decrement */}
                        <View className="mt-6 mb-6">
                            <Text className="mb-2 font-medium">Meals per day</Text>
                            <View className="flex-row items-center space-x-4">
                                <TouchableOpacity
                                    onPress={() =>
                                        setFormData(prev => ({
                                            ...prev,
                                            mealFrequency: Math.max(1, (prev.mealFrequency || 3) - 1)
                                        }))
                                    }
                                    className="bg-gray-200 p-2 rounded"
                                >
                                    <Text className="text-xl">−</Text>
                                </TouchableOpacity>
                                <Text className="text-lg font-semibold m-3">{formData.mealFrequency || 3}</Text>
                                <TouchableOpacity
                                    onPress={() =>
                                        setFormData(prev => ({
                                            ...prev,
                                            mealFrequency: Math.min(10, (prev.mealFrequency || 3) + 1)
                                        }))
                                    }
                                    className="bg-gray-200 p-2 rounded"
                                >
                                    <Text className="text-xl">＋</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Snack toggle */}
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="font-medium">Include snacks?</Text>
                            <Switch
                                value={formData.snackIncluded}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, snackIncluded: val }))}
                                trackColor={{ false: '#ccc', true: '#3b82f6' }}
                                thumbColor={formData.snackIncluded ? '#1d4ed8' : '#f4f3f4'}
                            />
                        </View>

                        {/* Completion Message */}
                        <View className="bg-gray-100 p-4 rounded-lg mt-4">
                            <Text className="text-sm font-semibold mb-2">🎉 You're all set!</Text>
                            <Text className="text-xs text-gray-500">
                                NutriAI will use this information to provide personalized nutrition advice and meal plans.
                            </Text>
                        </View>
                    </View>
                );

        }
    };

    return (
        <View className="flex-1 bg-white p-6">
            {/* Progress */}
            <View className="mb-4">
                <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <View className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
                </View>
            </View>

            {/* Scrollable Content */}
            <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
                {renderStep()}
            </ScrollView>

            {/* Navigation */}
            <View className="flex-row justify-around mt-6">
                {step > 1 && (
                    <TouchableOpacity
                        onPress={handleBack}
                        className="flex-row w-1/2 items-center justify-center border border-gray-300 rounded-lg px-4 py-3 mr-2"
                    >
                        <Text>Back</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    onPress={handleNext}
                    className="flex-row w-1/2 items-center justify-center bg-black rounded-lg px-4 py-3 ml-2"
                >
                    <Text className="text-white font-semibold">
                        {step === totalSteps ? 'Get Started' : 'Next'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
