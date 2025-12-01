import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Switch,
    ActivityIndicator,
    FlatList,
    Alert,
} from "react-native";
import {
    HelpCircle,
    LogOut,
    Edit,
    Save,
    X,
    User2Icon,
    ChevronDown,
    LanguagesIcon,
    ArrowDown,
    Globe,
} from "lucide-react-native";

import type {
    UserProfile,
    UpdateProfileData,
    UpdatePreferencesData,
    DailyGoals,
} from "@/services/userService";
import { i18n } from "@/lib/i18next";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/utils/apiWithAuth";
import toastConfig from "@/utils/toastConfig";
import { Toast } from "toastify-react-native";

type Props = {
    profile: UserProfile | null;
    editProfile: UpdateProfileData;
    setEditProfile: React.Dispatch<React.SetStateAction<UpdateProfileData>>;
    preferences: UpdatePreferencesData;
    setPreferences: React.Dispatch<React.SetStateAction<UpdatePreferencesData>>;
    dailyGoals: DailyGoals | null;
    editGoals: Partial<DailyGoals>;
    setEditGoals: React.Dispatch<React.SetStateAction<Partial<DailyGoals>>>;
    isEditing: boolean;
    setIsEditing: (v: boolean) => void;
    isSaving: boolean;
    onSave: () => Promise<void>;
    onCancel: () => void;
    onLogout: () => void;
    // onDeleteAccount: () => void;
    openDietModal: () => void;
    openMealModal: () => void;
    getDietTypeLabel: (s?: string) => string;
    getMealFrequencyLabel: (n?: number) => string;
};

export default function ProfileSections(props: Props) {
    const {
        profile,
        editProfile,
        setEditProfile,
        preferences,
        setPreferences,
        dailyGoals,
        editGoals,
        setEditGoals,
        isEditing,
        setIsEditing,
        isSaving,
        onSave,
        onCancel,
        onLogout,
        // onDeleteAccount,
        openDietModal,
        openMealModal,
        getDietTypeLabel,
        getMealFrequencyLabel,
    } = props;

    const goalKeys: (keyof DailyGoals)[] = ["calories", "protein", "carbs", "fats"];
    const { language, setLanguage } = useAuth();
    const [isLoading, setIsLoading] = useState(false)


    const toggleLanguage = async () => {
        // Show a confirmation dialog
        Alert.alert(
            i18n.t("profile.changeLanguageTitle"), // Title of the confirmation dialog
            i18n.t("profile.changeLanguageConfirmation"), // Message for the confirmation dialog
            [
                {
                    text: i18n.t("profile.cancel"), // Cancel button
                    onPress: () => {
                        console.log("Language change canceled");
                    },
                    style: "cancel",
                },
                {
                    text: i18n.t("profile.confirm"), // Confirm button
                    onPress: async () => {
                        try {
                            // Set loading state to true while the API request is in progress
                            setIsLoading(true);

                            // Switch between "en" and "it"
                            const newLang = language === "en" ? "it" : "en";

                            // Update the language state
                            setLanguage(newLang);
                            i18n.locale = newLang;

                            // Prepare the profile data for the API call
                            const profileData = {
                                language: newLang, // Assuming the profile data has a `language` field
                                // Add other necessary profile data here if needed
                            };

                            // Call the API to update the user's language preference
                            const response = await fetchWithAuth(`${process.env.EXPO_PUBLIC_API_URL}/user/profile`, {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(profileData),
                            });

                            if (!response.ok) {
                                throw new Error("Failed to update language preference");
                            }

                            // Handle the response (e.g., update UI or notify the user)
                            const responseData = await response.json();
                            console.log("Language updated successfully:", responseData);

                            Toast.success(i18n.t("profile.languageUpdatedSuccessfully")); // Adjust the message for your localization
                        } catch (error) {
                            // Handle errors (e.g., show a toast or alert)
                            console.error("Error updating language:", error);
                            Alert.alert(i18n.t("profile.languageUpdateFailed")); // Adjust error message
                        } finally {
                            // Set loading state to false once the API request is finished
                            setIsLoading(false);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };


    return (
        <View>
            {/* Header */}
            <View className="p-6 pb-4">
                <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-row items-center gap-4">
                        <View className="w-10 h-10 bg-green-600 rounded-full items-center justify-center">
                            <User2Icon size={18} color="white" />
                        </View>
                        <View>
                            <Text className="text-xl">{profile?.username}</Text>
                            <Text className="text-sm text-muted-foreground">{profile?.email}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={isEditing ? onCancel : () => setIsEditing(true)}
                        className="px-3 py-2 border rounded-md border-gray-300 flex-row items-center gap-2"
                    >
                        {isEditing ? <X size={16} color="black" /> : <Edit size={16} color="black" />}
                        <Text>{isEditing ? `${i18n.t("profile.cancel")}` : `${i18n.t("profile.edit")}`}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Personal Info */}
            <View className="px-6 mb-6">
                <View className="bg-white rounded-2xl p-4 shadow-md border border-gray-200">
                    <SectionHeader title={i18n.t("profile.personalInfo")} isEditing={isEditing} onSave={onSave} isSaving={isSaving} />

                    <View className="flex-row gap-4 mb-4">
                        <Field label={i18n.t("profile.username")} >
                            {isEditing ? (
                                <TextInput
                                    className="border border-border rounded-md px-2 py-1 mt-1"
                                    value={editProfile.username ?? ""}
                                    onChangeText={(text) => setEditProfile((p) => ({ ...p, username: text }))}
                                />
                            ) : (
                                <Text className="text-sm mt-1">{profile?.username}</Text>
                            )}
                        </Field>

                        <Field label={i18n.t("profile.age")}>
                            {isEditing ? (
                                <TextInput
                                    className="border border-border rounded-md px-2 py-1 mt-1"
                                    keyboardType="numeric"
                                    value={editProfile.age?.toString() ?? ""}
                                    onChangeText={(text) =>
                                        setEditProfile((p) => ({ ...p, age: text === "" ? undefined : parseInt(text) }))
                                    }
                                />
                            ) : (
                                <Text className="text-sm mt-1">{profile?.age ? `${profile.age} ${i18n.t("profile.years")}` : `${i18n.t("profile.notSet")}`}</Text>
                            )}
                        </Field>
                    </View>

                    <View className="flex-row gap-4 mb-4">
                        <Field label={i18n.t("profile.weight")}>
                            {isEditing ? (
                                <TextInput
                                    className="border border-border rounded-md px-2 py-1 mt-1"
                                    keyboardType="numeric"
                                    value={editProfile.weight?.toString() ?? ""}
                                    onChangeText={(text) =>
                                        setEditProfile((p) => ({ ...p, weight: text === "" ? undefined : parseFloat(text) }))
                                    }
                                />
                            ) : (
                                <Text className="text-sm mt-1">{profile?.weight ? `${profile.weight} kg` : `${i18n.t("profile.notSet")}`}</Text>
                            )}
                        </Field>

                        <Field label={i18n.t("profile.height")}>
                            {isEditing ? (
                                <TextInput
                                    className="border border-border rounded-md px-2 py-1 mt-1"
                                    keyboardType="numeric"
                                    value={editProfile.height?.toString() ?? ""}
                                    onChangeText={(text) =>
                                        setEditProfile((p) => ({ ...p, height: text === "" ? undefined : parseFloat(text) }))
                                    }
                                />
                            ) : (
                                <Text className="text-sm mt-1">{profile?.height ? `${profile.height} cm` : `${i18n.t("profile.notSet")}`}</Text>
                            )}
                        </Field>
                    </View>

                    <View className="flex-row gap-4">
                        <Field label="Activity Level">
                            <Text className="text-sm mt-1 capitalize">{profile?.activityLevel ?? `${i18n.t("profile.notSet")}`}</Text>
                        </Field>

                        <Field label={i18n.t("profile.gender")}>
                            <Text className="text-sm mt-1 capitalize">{profile?.gender ?? `${i18n.t("profile.notSet")}`}</Text>
                        </Field>
                    </View>
                </View>
            </View>

            {/* Preferences */}
            <View className="px-6 mb-6">
                <View className="bg-white rounded-2xl p-4 shadow-md border border-gray-200">
                    <SectionHeader title={i18n.t("profile.preferences")} isEditing={isEditing} onSave={onSave} isSaving={isSaving} />

                    {/* Diet Type */}
                    <View className="mb-4">
                        <Text className="text-xs text-muted-foreground mb-2">{i18n.t("profile.dietType")}</Text>
                        {isEditing ? (
                            <TouchableOpacity
                                onPress={openDietModal}
                                className="border border-border rounded-md px-3 py-2 flex-row items-center justify-between"
                            >
                                <Text className="text-sm">
                                    {preferences.dietType
                                        ? getDietTypeLabel(preferences.dietType)
                                        : profile?.preferences?.dietType
                                            ? getDietTypeLabel(profile.preferences.dietType)
                                            : `${i18n.t("profile.selectDietType")}`}
                                </Text>
                                <ChevronDown size={16} color="gray" />
                            </TouchableOpacity>
                        ) : (
                            <Text className="text-sm mt-1">
                                {profile?.preferences?.dietType ? getDietTypeLabel(profile.preferences.dietType) : `${i18n.t("profile.notSet")}`}
                            </Text>
                        )}
                    </View>

                    {/* Meal Frequency */}
                    <View className="mb-4">
                        <Text className="text-xs text-muted-foreground mb-2">{i18n.t("profile.mealFrequency")}</Text>
                        {isEditing ? (
                            <TouchableOpacity
                                onPress={openMealModal}
                                className="border border-border rounded-md px-3 py-2 flex-row items-center justify-between"
                            >
                                <Text className="text-sm">
                                    {preferences.mealFrequency
                                        ? getMealFrequencyLabel(preferences.mealFrequency)
                                        : profile?.preferences?.mealFrequency
                                            ? getMealFrequencyLabel(profile.preferences.mealFrequency)
                                            : `${i18n.t("profile.selectMealFrequency")}`}
                                </Text>
                                <ChevronDown size={16} color="gray" />
                            </TouchableOpacity>
                        ) : (
                            <Text className="text-sm mt-1">
                                {profile?.preferences?.mealFrequency ? getMealFrequencyLabel(profile.preferences.mealFrequency) : `${i18n.t("profile.notSet")}`}
                            </Text>
                        )}
                    </View>

                    {/* Snack Included */}
                    <View className="flex-row items-center justify-between py-2 mb-4">
                        <Text className="text-sm">{i18n.t("profile.includeSnacks")}</Text>
                        <Switch
                            value={
                                preferences.snackIncluded !== undefined
                                    ? preferences.snackIncluded
                                    : profile?.preferences?.snackIncluded ?? false
                            }
                            onValueChange={(checked) => setPreferences((p) => ({ ...p, snackIncluded: checked }))}
                            disabled={!isEditing}
                        />
                    </View>

                    {/* Allergies */}
                    <View>
                        <Text className="text-xs text-muted-foreground mb-2">{i18n.t("profile.allergies")}</Text>
                        {isEditing ? (
                            <TextInput
                                className="border border-border rounded-md px-3 py-2 text-sm"
                                placeholder="Enter allergies (comma separated)"
                                value={
                                    preferences.allergies !== undefined ? preferences.allergies : profile?.preferences?.allergies ?? ""
                                }
                                onChangeText={(text) => setPreferences((p) => ({ ...p, allergies: text }))}
                                multiline
                                numberOfLines={2}
                            />
                        ) : (
                            <Text className="text-sm mt-1">{profile?.preferences?.allergies ?? `${i18n.t("profile.none")}`}</Text>
                        )}
                    </View>
                </View>
            </View>

            {/* Daily Goals */}
            <View className="px-6 mb-6">
                <View className="bg-white rounded-2xl p-4 shadow-md border border-gray-200">
                    <SectionHeader title={i18n.t("profile.dailyGoals")} isEditing={isEditing} onSave={onSave} isSaving={isSaving} />

                    {goalKeys.map((key) => (
                        <View key={key} className="mb-4">
                            <Text className="text-xs text-muted-foreground capitalize">{key}</Text>
                            {isEditing ? (
                                <TextInput
                                    className="border border-border rounded-md px-2 py-1 mt-1"
                                    keyboardType="numeric"
                                    value={editGoals?.[key] !== undefined ? editGoals[key]?.toString() : ""}
                                    onChangeText={(text) =>
                                        setEditGoals((prev) => ({ ...prev, [key]: text === "" ? undefined : parseInt(text) }))
                                    }
                                />
                            ) : (
                                <Text className="text-sm mt-1">
                                    {dailyGoals?.[key]} {key === "calories" ? "kcal" : "g"}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>
            </View>

            {/* Settings */}
            <View className="px-6 pb-6">
                <View className="bg-white rounded-2xl p-4 shadow-md border border-gray-200">
                    <TouchableOpacity className="flex-row items-center justify-between gap-3 p-2">
                        <View className="flex-row gap-3 p-2">
                            <LanguagesIcon size={18} color="black" />
                            <Text className="text-sm">{i18n.t("profile.changeLanguage")}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={toggleLanguage}
                            disabled={isLoading} // Disable the button if loading is true
                            className="flex-row bg-gray-200 p-2 px-4 rounded-md gap-1"
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="black" />
                            ) : (
                                <>
                                    <Globe size={18} color="black" />
                                    <Text className="text-gray-800">
                                        {language === "en" ? "Italian" : "English"}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center gap-3 p-4">
                        <HelpCircle size={18} color="black" />
                        <Text className="text-sm">{i18n.t("profile.helpSupport")}</Text>
                    </TouchableOpacity>
                    <View className="h-[1px] bg-border" />
                    <TouchableOpacity className="flex-row items-center gap-3 p-4" onPress={onLogout}>
                        <LogOut size={18} color="red" />
                        <Text className="text-sm text-red-500">{i18n.t("profile.signOut")}</Text>
                    </TouchableOpacity>
                    <View className="h-[1px] bg-border" />
                    {/* <TouchableOpacity className="flex-row items-center gap-3 p-4" onPress={onDeleteAccount}>
                        <Trash2 size={18} color="red" />
                        <Text className="text-sm text-red-500">Delete Account</Text>
                    </TouchableOpacity> */}
                </View>
            </View>
        </View>
    );
}

/* Small helpers used by the component */
function SectionHeader({
    title,
    isEditing,
    onSave,
    isSaving,
}: {
    title: string;
    isEditing: boolean;
    isSaving: boolean;
    onSave: () => Promise<void>;
}) {
    return (
        <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
                <Text className="text-base">{title}</Text>
            </View>
            {isEditing && (
                <TouchableOpacity onPress={onSave} disabled={isSaving} className="px-2 py-1 bg-primary rounded-md flex-row items-center gap-1">
                    {isSaving ? <ActivityIndicator size="small" color="#fff" /> : <><Save size={14} color="black" /><Text className="text-sm">{i18n.t("profile.save")}</Text></>}
                </TouchableOpacity>
            )}
        </View>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <View className="flex-1">
            <Text className="text-xs text-muted-foreground">{label}</Text>
            {children}
        </View>
    );
}
