import { Picker } from "@react-native-picker/picker";
import { ArrowLeft, Check, Edit3, ForkKnife, Send, Utensils } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import { Toast } from "toastify-react-native";

import { useAuth } from "@/context/AuthContext";
import { analyzeMealWithAI, MealData, saveMeal } from "@/services/mealService";

type Step = "input" | "confirm";

interface MealLoggingModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (mealData: MealData) => void;
}

// ---------- MAIN COMPONENT ---------- //
export function MealLoggingModal({ open, onClose, onSave }: MealLoggingModalProps) {
  const [step, setStep] = useState<Step>("input");
  const [inputValue, setInputValue] = useState("");
  const [errorResponse, setErrorResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const [mealData, setMealData] = useState<MealData>({
    customName: "",
    mealType: "breakfast",
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    servings: 1,
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleClose = () => {
    setStep("input");
    setInputValue("");
    setMealData({
      customName: "",
      mealType: "breakfast",
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      servings: 1,
    });
    setIsEditing(false);
    onClose();
  };

  const handleProcessInput = async () => {
    setErrorResponse("");
    if (!inputValue.trim()) return;
    setIsProcessing(true);
    try {
      const userId = user?.id ? Number(user.id) : undefined;
      if (!userId || Number.isNaN(userId)) {
        throw new Error("Missing or invalid userId");
      }
      const response = await analyzeMealWithAI(inputValue);
      const resData = await response.json();
      if (response.status === 201) {
        const d = resData || {};
        setMealData({
          customName: d.customName ?? "",
          mealType: (d.mealType ?? "BREAKFAST").toString().toLowerCase(),
          calories: Math.round(d.calories ?? 0),
          protein: Math.round(d.protein ?? 0),
          carbs: Math.round(d.carbs ?? 0),
          fats: Math.round(d.fats ?? 0),
          servings: d.servings ?? 1,
        });
        setStep("confirm");
      } else if (response.status === 200) {
        setErrorResponse(resData.question || "Please provide more details about your meal.");
      }
    } catch (error: any) {
      setErrorResponse(error?.response?.data?.error || error?.message || "Failed to process meal");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    setIsProcessing(true);
    setErrorResponse("");
    try {
      const userId = user?.id ? Number(user.id) : undefined;
      if (!userId || Number.isNaN(userId)) {
        throw new Error("Missing or invalid userId");
      }
      const payload = {
        userId,
        mealType: mealData.mealType.toUpperCase(),
        customName: mealData.customName || null,
        calories: mealData.calories,
        protein: mealData.protein,
        carbs: mealData.carbs,
        fats: mealData.fats,
        servings: mealData.servings ?? 1.0,
        mealDate: new Date().toISOString(),
      };
      const success = await saveMeal(payload);
      if (success) {
        onSave(mealData);
        handleClose();
        Toast.show({
          type: "success",
          text1: "Your Meal is Logged!",
          // text2: 'Secondary message',
          position: "top",
          visibilityTime: 3000,
          autoHide: true,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error,
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
      });
      console.log(error);
      setErrorResponse(error?.response?.data?.error || error?.message || "Failed to save meal");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderInputStep = () => (
    <View className="space-y-6">
      <View className="items-center">
        <View className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
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

        <View className="my-2">
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
              className="bg-green-600 px-4 py-3 rounded-lg items-center justify-center"
              disabled={!inputValue.trim() || isProcessing}
              onPress={handleProcessInput}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Send size={18} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
        {errorResponse !== "" && (
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
        <TouchableOpacity className="flex-row items-center" onPress={() => setStep("input")}>
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
      <View className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
        {/* Meal Name */}
        <View className="space-y-2">
          <Text className="text-gray-600">Meal Name</Text>
          {isEditing ? (
            <TextInput
              placeholder="Enter meal name"
              value={mealData.customName}
              onChangeText={text => setMealData(p => ({ ...p, customName: text }))}
              className="border border-gray-300 rounded-lg px-3 py-2 mt-3"
            />
          ) : (
            <Text className="text-lg font-medium">{mealData.customName}</Text>
          )}
        </View>

        {/* Meal Type & Servings */}
        <View className="flex-col justify-between space-x-4 mt-3">
          {/* Meal Type */}
          <View className="flex-1">
            <Text className="text-gray-600">Meal Type</Text>
            {isEditing ? (
              <View className="border border-gray-300 rounded-lg mt-3">
                <Picker
                  selectedValue={mealData.mealType}
                  onValueChange={itemValue => setMealData(p => ({ ...p, mealType: itemValue }))}
                >
                  <Picker.Item label="Breakfast" value="BREAKFAST" />
                  <Picker.Item label="Lunch" value="LUNCH" />
                  <Picker.Item label="Dinner" value="DINNER" />
                  <Picker.Item label="Snack" value="SNACKS" />
                </Picker>
              </View>
            ) : (
              <Text className="capitalize">{mealData.mealType}</Text>
            )}
          </View>
          {/* Servings */}
          <View className="flex-row space-y-1 justify-center mt-3">
            <Text className="text-gray-600 my-auto">Servings</Text>
            {isEditing ? (
              <View className="flex-row items-center border border-gray-300 rounded-lg overflow-hidden mx-auto justify-center">
                <TouchableOpacity
                  className="px-3 py-2 bg-gray-100"
                  onPress={() => {
                    if (mealData.servings > 1) {
                      setMealData(p => ({ ...p, servings: p.servings - 1 }));
                    }
                  }}
                >
                  <Text className="text-lg">−</Text>
                </TouchableOpacity>

                <Text className="px-4 text-base">{mealData.servings}</Text>

                <TouchableOpacity
                  className="px-3 py-2 bg-gray-100"
                  onPress={() => setMealData(p => ({ ...p, servings: p.servings + 1 }))}
                >
                  <Text className="text-lg">+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text>{mealData.servings}</Text>
            )}
          </View>
        </View>

        {/* Nutrition Info */}
        <View className="pt-2">
          <Text className="text-center text-sm text-gray-500 mb-2">Nutritional Information</Text>

          <View className="flex-row flex-wrap justify-between">
            {[
              { label: "Calories", value: mealData.calories, color: "text-blue-600" },
              { label: "Protein", value: `${mealData.protein}g`, color: "text-green-600" },
              { label: "Carbs", value: `${mealData.carbs}g`, color: "text-orange-600" },
              { label: "Fats", value: `${mealData.fats}g`, color: "text-purple-600" },
            ].map((item, index) => (
              <View key={index} className="items-center mb-4">
                <Text className={`text-2xl ${item.color}`}>{item.value}</Text>
                <Text className="text-xs text-gray-500">{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Editable macros (only in edit mode) */}
          {isEditing && (
            <View className="flex-row flex-wrap justify-between gap-y-4 pt-2">
              {[
                { key: "calories", label: "Calories" },
                { key: "protein", label: "Protein (g)" },
                { key: "carbs", label: "Carbs (g)" },
                { key: "fats", label: "Fats (g)" },
              ].map((macro, i) => (
                <View key={i} className="w-[48%]">
                  <Text className="text-sm mb-1">{macro.label}</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={String(mealData[macro.key as keyof MealData])}
                    onChangeText={value =>
                      setMealData(p => ({
                        ...p,
                        [macro.key]: parseInt(value) || 0,
                      }))
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  />
                </View>
              ))}
            </View>
          )}
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
          <Text className="text-white ml-2">{isProcessing ? "Saving..." : "Save Meal"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={handleClose}>
      <TouchableWithoutFeedback
        onPress={handleClose}
        accessible={false}
      >
        <View className="flex-1 bg-black/40 justify-center px-4">
          <TouchableWithoutFeedback onPress={() => { }}>
            <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-h-[85%]">
              <Text className="text-lg font-bold flex-row items-center mb-4">Log Your Meal</Text>
              <ScrollView>
                {step === "input" ? renderInputStep() : renderConfirmStep()}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
