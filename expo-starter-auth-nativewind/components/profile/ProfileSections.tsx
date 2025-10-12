import React from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Switch,
    ActivityIndicator,
    FlatList,
} from "react-native";
import {
    HelpCircle,
    LogOut,
    Edit,
    Save,
    X,
    User2Icon,
    ChevronDown,
} from "lucide-react-native";

import type {
    UserProfile,
    UpdateProfileData,
    UpdatePreferencesData,
    DailyGoals,
} from "@/services/userService";

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
                        <Text>{isEditing ? "Cancel" : "Edit"}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Personal Info */}
            <View className="px-6 mb-6">
                <View className="bg-card rounded-xl p-4 border border-gray-300">
                    <SectionHeader title="Personal Information" isEditing={isEditing} onSave={onSave} isSaving={isSaving} />

                    <View className="flex-row gap-4 mb-4">
                        <Field label="Username" >
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

                        <Field label="Age">
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
                                <Text className="text-sm mt-1">{profile?.age ? `${profile.age} years` : "Not set"}</Text>
                            )}
                        </Field>
                    </View>

                    <View className="flex-row gap-4 mb-4">
                        <Field label="Weight (kg)">
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
                                <Text className="text-sm mt-1">{profile?.weight ? `${profile.weight} kg` : "Not set"}</Text>
                            )}
                        </Field>

                        <Field label="Height (cm)">
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
                                <Text className="text-sm mt-1">{profile?.height ? `${profile.height} cm` : "Not set"}</Text>
                            )}
                        </Field>
                    </View>

                    <View className="flex-row gap-4">
                        <Field label="Activity Level">
                            <Text className="text-sm mt-1 capitalize">{profile?.activityLevel ?? "Not set"}</Text>
                        </Field>

                        <Field label="Gender">
                            <Text className="text-sm mt-1 capitalize">{profile?.gender ?? "Not set"}</Text>
                        </Field>
                    </View>
                </View>
            </View>

            {/* Preferences */}
            <View className="px-6 mb-6">
                <View className="bg-card rounded-xl p-4 border border-gray-300">
                    <SectionHeader title="Preferences" isEditing={isEditing} onSave={onSave} isSaving={isSaving} />

                    {/* Diet Type */}
                    <View className="mb-4">
                        <Text className="text-xs text-muted-foreground mb-2">Diet Type</Text>
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
                                            : "Select diet type"}
                                </Text>
                                <ChevronDown size={16} color="gray" />
                            </TouchableOpacity>
                        ) : (
                            <Text className="text-sm mt-1">
                                {profile?.preferences?.dietType ? getDietTypeLabel(profile.preferences.dietType) : "Not set"}
                            </Text>
                        )}
                    </View>

                    {/* Meal Frequency */}
                    <View className="mb-4">
                        <Text className="text-xs text-muted-foreground mb-2">Meals per Day</Text>
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
                                            : "Select meal frequency"}
                                </Text>
                                <ChevronDown size={16} color="gray" />
                            </TouchableOpacity>
                        ) : (
                            <Text className="text-sm mt-1">
                                {profile?.preferences?.mealFrequency ? getMealFrequencyLabel(profile.preferences.mealFrequency) : "Not set"}
                            </Text>
                        )}
                    </View>

                    {/* Snack Included */}
                    <View className="flex-row items-center justify-between py-2 mb-4">
                        <Text className="text-sm">Include Snacks</Text>
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
                        <Text className="text-xs text-muted-foreground mb-2">Allergies</Text>
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
                            <Text className="text-sm mt-1">{profile?.preferences?.allergies ?? "None"}</Text>
                        )}
                    </View>
                </View>
            </View>

            {/* Daily Goals */}
            <View className="px-6 mb-6">
                <View className="bg-card rounded-xl p-4 border border-gray-300">
                    <SectionHeader title="Daily Nutritional Goals" isEditing={isEditing} onSave={onSave} isSaving={isSaving} />

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
                <View className="bg-card rounded-xl border border-gray-300">
                    <TouchableOpacity className="flex-row items-center gap-3 p-4">
                        <HelpCircle size={18} color="black" />
                        <Text className="text-sm">Help & Support</Text>
                    </TouchableOpacity>
                    <View className="h-[1px] bg-border" />
                    <TouchableOpacity className="flex-row items-center gap-3 p-4" onPress={onLogout}>
                        <LogOut size={18} color="red" />
                        <Text className="text-sm text-red-500">Sign Out</Text>
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
                    {isSaving ? <ActivityIndicator size="small" color="#fff" /> : <><Save size={14} color="black" /><Text className="text-sm">Save</Text></>}
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
