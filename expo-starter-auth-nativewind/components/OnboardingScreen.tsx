import DateTimePicker from "@react-native-community/datetimepicker";
import LottieView from "lottie-react-native";
import { Sparkles } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
} from "react-native";

import { CustomCheckbox } from "./CustomCheckbox";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/utils/apiWithAuth";
import { Toast } from "toastify-react-native";
import { i18n } from "@/lib/i18next";

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { user, completeProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [customAllergy, setCustomAllergy] = useState("");
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successAnimRef = useRef<LottieView>(null);
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    gender: "",
    activityLevel: "",
    goal: "",
    goalDescription: "",
    goalEndDate: "",
    dietType: "OMNIVORE", // default value from your enum
    allergies: [] as string[],
    mealFrequency: 3,
    snackIncluded: true,
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const showDatePicker = () => {
    setIsDatePickerVisible(true);
  };

  const handleNext = async () => {
    // Step 1 Validation
    if (step === 1) {
      const { age, weight, height, gender } = formData;

      // Validate Age
      if (!age || isNaN(Number(age))) {
        Toast.error(i18n.t('validation.ageError'));
        return;
      }

      // Validate Weight
      if (!weight || isNaN(Number(weight))) {
        Toast.error(i18n.t('validation.weightError'));
        return;
      }

      // Validate Height
      if (!height || isNaN(Number(height))) {
        Toast.error(i18n.t('validation.heightError'));
        return;
      }

      // Validate Gender
      if (!gender) {
        Toast.error(i18n.t('validation.genderError'));
        return;
      }
    }

    // Step 2 Validation
    if (step === 2) {
      if (!formData.activityLevel) {
        Toast.error(i18n.t('validation.activityLevelError'));
        return;
      }
    }

    // Step 3 Validation
    if (step === 3) {
      if (!formData.goal) {
        Toast.error(i18n.t('validation.goalError'));
        return;
      }
      if (!formData.goalDescription) {
        Toast.error(i18n.t('validation.goalDescriptionError'));
        return;
      }
      if (!formData.goalEndDate) {
        Toast.error(i18n.t('validation.goalEndDateError'));
        return;
      }
    }


    if (step < totalSteps) {
      setStep(step + 1);
      return;
    }
    setIsSubmitting(true);

    try {
      console.log("FormData is ", formData);

      const profileData = {
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        age: parseInt(formData.age),
        gender: formData.gender,
        activityLevel: formData.activityLevel.toUpperCase(),
        mealFrequency: formData.mealFrequency,
        snackIncluded: formData.snackIncluded,
        dietType: formData.dietType,
        allergies: formData.allergies.join(","),
        dietaryGoals: [
          {
            type: formData.goal,
            description: formData.goalDescription || null,
            endDate: formData.goalEndDate || null,
          },
        ],
      };
      const response = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/complete_profile`, {
        method: "POST",
        body: JSON.stringify(profileData),
      });
      if (response.status === 200) {
        console.log("✅ Profile completed successfully");

        // Show success animation
        setShowSuccess(true);
        setIsSubmitting(false);

        // Delay for animation (e.g. 2 seconds)
        setTimeout(async () => {
          await completeProfile();
          onComplete();
        }, 4000);
      } else {
        throw new Error("Failed response");
      }
    } catch (error) {
      console.error("❌ Profile completion error:", error);
      Toast.error("Failed to complete profile. Please try again.");
      setIsSubmitting(false);
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
          : [...current, allergy],
      };
    });
  };
  // Loading Spinner Overlay
  if (isSubmitting) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="green" />
        <Text className="mt-4">{i18n.t('buttons.submittingProfile')}</Text>
      </View>
    );
  }

  // Success Animation Overlay
  if (showSuccess) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <LottieView
          ref={successAnimRef}
          source={require("../assets/lottie/success.json")}
          autoPlay
          loop={false}
          style={{ width: 200, height: 200 }}
        />
        <Text className="mt-4 text-lg font-semibold">{i18n.t('buttons.profileCompleted')}</Text>
      </View>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View className="my-6">
            <View className="items-center">
              <View className="w-20 h-20 bg-black rounded-full items-center justify-center mb-4">
                <Sparkles color="white" size={32} />
              </View>
              <Text className="text-3xl font-bold mb-4">{i18n.t('step1.welcome', { username: user?.username })}</Text>
              <Text className="text-xl font-bold mb-2">{i18n.t('step1.welcomeMessage')}</Text>
              <Text className="text-gray-500">{i18n.t('step1.assistant')}</Text>
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
                  <Text className="mb-1">{i18n.t('step1.age')}</Text>
                  <TextInput
                    value={formData.age}
                    onChangeText={text => setFormData(prev => ({ ...prev, age: text }))}
                    placeholder="25"
                    keyboardType="numeric"
                    className="bg-gray-100 rounded-lg px-3 py-3"
                  />
                </View>
                <View className="flex-1">
                  <Text className="mb-1">{i18n.t('step1.weight')}</Text>
                  <TextInput
                    value={formData.weight}
                    onChangeText={text => setFormData(prev => ({ ...prev, weight: text }))}
                    placeholder="70"
                    keyboardType="numeric"
                    className="bg-gray-100 rounded-lg px-3 py-3"
                  />
                </View>
              </View>

              <View className="my-4">
                <Text className="mb-1">{i18n.t('step1.height')}</Text>
                <TextInput
                  value={formData.height}
                  onChangeText={text => setFormData(prev => ({ ...prev, height: text }))}
                  placeholder="175"
                  keyboardType="numeric"
                  className="bg-gray-100 rounded-lg px-3 py-3"
                />
              </View>
              <View className="my-4">
                <Text className="mb-1">{i18n.t('step1.gender')}</Text>
                <View className="flex-row justify-between">
                  {/* Male Button */}
                  <TouchableOpacity
                    onPress={() => setFormData(prev => ({ ...prev, gender: "Male" }))}
                    style={{
                      flex: 1,
                      padding: 12,
                      backgroundColor: formData.gender === "Male" ? "#000000" : "#e0e0e0", // Change color if selected
                      borderRadius: 8,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <Text style={{ color: formData.gender === "Male" ? "#fff" : "#000" }}>
                      {i18n.t('step1.male')}
                    </Text>
                  </TouchableOpacity>

                  {/* Female Button */}
                  <TouchableOpacity
                    onPress={() => setFormData(prev => ({ ...prev, gender: "Female" }))}
                    style={{
                      flex: 1,
                      padding: 12,
                      backgroundColor: formData.gender === "Female" ? "#000000" : "#e0e0e0", // Change color if selected
                      borderRadius: 8,
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: 10,
                    }}
                  >
                    <Text style={{ color: formData.gender === "Female" ? "#fff" : "#000" }}>
                      {i18n.t('step1.female')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <View className="my-6">
            <Text className="text-center text-3xl font-semibold mb-4">{i18n.t('step2.activityLevel')}</Text>
            <Text className="text-center text-gray-500 mb-8">
              {i18n.t('step2.activityDescription')}
            </Text>
            {[
              { value: "Sedentary", label: `${i18n.t('step2.sedentary')}`, desc: `${i18n.t('step2.sedentaryDesc')}` },
              { value: "Light", label: `${i18n.t('step2.lightlyActive')}`, desc: `${i18n.t('step2.lightlyActiveDesc')}` },
              {
                value: "Moderate",
                label: `${i18n.t('step2.moderatelyActive')}`,
                desc: `${i18n.t('step2.moderatelyActiveDesc')}`,
              },
              { value: "Very active", label: `${i18n.t('step2.veryActive')}`, desc: `${i18n.t('step2.veryActiveDesc')}` },
            ].map(option => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setFormData(prev => ({ ...prev, activityLevel: option.value }))}
                className={`my-3 p-4 border rounded-lg ${formData.activityLevel === option.value
                  ? "border-green-600 bg-green-200"
                  : "border-gray-300"
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
            <Text className="text-center text-3xl font-semibold mb-4">{i18n.t('step3.yourGoals')}</Text>
            <Text className="text-center text-gray-500 mb-8">
              {i18n.t('step3.fitnessGoal')}
            </Text>

            {/* Goals Selection */}
            <View className="flex-row flex-wrap justify-between">
              {[
                { value: "FAT_LOSS", label: i18n.t('step3.fatLoss.label'), emoji: "🔥" },
                { value: "MUSCLE_GAIN", label: i18n.t('step3.muscleGain.label'), emoji: "💪" },
                { value: "MAINTENANCE", label: i18n.t('step3.maintenance.label'), emoji: "⚖️" },
                { value: "GENERAL_HEALTH", label: i18n.t('step3.generalHealth.label'), emoji: "🌱" },
              ].map(option => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setFormData(prev => ({ ...prev, goal: option.value }))}
                  className={`w-[48%] p-4 border rounded-lg mb-4 ${formData.goal === option.value
                    ? "border-green-600 bg-green-200"
                    : "border-gray-300"
                    }`}
                >
                  <View className="flex-row justify-center items-center">
                    <Text className="text-2xl mr-2">{option.emoji}</Text>
                    <Text className="text-base">{option.label}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Goal Description */}
            <View className="my-4">
              <Text className="mb-1 font-medium">{i18n.t('step3.whyIsThisYourGoal')}</Text>
              <TextInput
                value={formData.goalDescription}
                onChangeText={text => setFormData(prev => ({ ...prev, goalDescription: text }))}
                placeholder={i18n.t('step3.goalDescriptionPlaceholder')}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="bg-gray-100 rounded-lg px-3 py-3"
              />
            </View>

            {/* Goal End Date Picker */}
            <View className="my-4">
              <Text className="mb-1 font-medium">{i18n.t('step3.targetEndDate')}</Text>
              <TouchableOpacity
                onPress={showDatePicker}
                className="bg-gray-100 rounded-lg px-3 py-3"
              >
                <Text className="text-gray-700">
                  {formData.goalEndDate
                    ? new Date(formData.goalEndDate).toLocaleDateString()
                    : "Select a date"}
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
                        goalEndDate: selectedDate.toISOString(),
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
            <Text className="text-center text-3xl font-semibold mb-4">{i18n.t('step4.dietaryPreferences')}</Text>
            <Text className="text-center text-gray-500 mb-8">
              {i18n.t('step4.tellUsMore')}
            </Text>

            {/* Allergy selection */}
            <View>
              <Text className="mb-2 font-medium text-2xl text-center">{i18n.t('step4.allergies')}</Text>

              {/* Combined Allergy Grid */}
              <View className="flex-row flex-wrap justify-between">
                {[
                  ...["Nuts", "Dairy", "Gluten", "Shellfish", "Eggs", "Soy", "Fish"],
                  ...formData.allergies.filter(
                    a =>
                      !["Nuts", "Dairy", "Gluten", "Shellfish", "Eggs", "Soy", "Fish"].includes(a),
                  ),
                ].map(allergy => (
                  <View key={allergy} className="w-[48%] mb-2">
                    <CustomCheckbox
                      value={formData.allergies.includes(allergy)}
                      onValueChange={() => handleAllergyToggle(allergy)}
                      label={i18n.t(`step4.allergy.${allergy}`)} // Translated allergy label
                    />
                  </View>
                ))}
              </View>

              {/* Custom allergy input */}
              <View className="flex-row items-center mt-4">
                <TextInput
                  value={customAllergy}
                  onChangeText={setCustomAllergy}
                  placeholder={i18n.t('step4.addCustomAllergy')}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 mr-4"
                />
                <TouchableOpacity
                  onPress={() => {
                    const trimmed = customAllergy.trim();
                    if (trimmed && !formData.allergies.includes(trimmed)) {
                      setFormData(prev => ({
                        ...prev,
                        allergies: [...prev.allergies, trimmed],
                      }));
                      setCustomAllergy("");
                    }
                  }}
                  className="bg-red-600 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-bold text-center">{i18n.t('step4.add')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Meal frequency input with increment/decrement */}
            <View className="mt-6 mb-6">
              <Text className="mb-2 font-medium">{i18n.t('step4.mealsPerDay')}</Text>
              <View className="flex-row items-center space-x-4">
                <TouchableOpacity
                  onPress={() =>
                    setFormData(prev => ({
                      ...prev,
                      mealFrequency: Math.max(1, (prev.mealFrequency || 3) - 1),
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
                      mealFrequency: Math.min(10, (prev.mealFrequency || 3) + 1),
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
              <Text className="font-medium">{i18n.t('step4.includeSnacks')}</Text>
              <Switch
                value={formData.snackIncluded}
                onValueChange={val => setFormData(prev => ({ ...prev, snackIncluded: val }))}
                trackColor={{ false: "#ccc", true: "#3b82f6" }}
                thumbColor={formData.snackIncluded ? "#1d4ed8" : "#f4f3f4"}
              />
            </View>

            {/* Completion Message */}
            <View className="bg-gray-100 p-4 rounded-lg mt-4">
              <Text className="text-sm font-semibold mb-2">{i18n.t('step4.completionTitle')}</Text>
              <Text className="text-xs text-gray-500">
                {i18n.t('step4.completionDescription')}
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
          <View className="h-full bg-green-600" style={{ width: `${progress}%` }} />
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
            <Text>{i18n.t('buttons.back')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleNext}
          className="flex-row w-1/2 items-center justify-center bg-black rounded-lg px-4 py-3 ml-2"
        >
          <Text className="text-white font-semibold">
            {step === totalSteps ? `${i18n.t('buttons.getStarted')}` : `${i18n.t('buttons.next')}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
