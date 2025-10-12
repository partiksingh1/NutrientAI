// screens/ProfileScreen.tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import {
  UserProfile,
  UpdateProfileData,
  UpdatePreferencesData,
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
  deleteUserAccount,
  DailyGoals,
  getDailyGoals,
  updateDailyGoals,
} from "@/services/userService";
import ProfileSections from "@/components/profile/ProfileSections";
import { DietTypeModal, MealFrequencyModal } from "@/components/profile/Modals";

const dietTypes = [
  { value: "OMNIVORE", label: "Omnivore" },
  { value: "VEGETARIAN", label: "Vegetarian" },
  { value: "VEGAN", label: "Vegan" },
  { value: "KETO", label: "Keto" },
  { value: "PALEO", label: "Paleo" },
  { value: "GLUTEN_FREE", label: "Gluten Free" },
  { value: "OTHER", label: "Other" },
] as const;

const mealFrequencies = [
  { value: 1, label: "1 meal per day" },
  { value: 2, label: "2 meals per day" },
  { value: 3, label: "3 meals per day" },
  { value: 4, label: "4 meals per day" },
  { value: 5, label: "5 meals per day" },
  { value: 6, label: "6 meals per day" },
] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editProfile, setEditProfile] = useState<UpdateProfileData>({});
  const [preferences, setPreferences] = useState<UpdatePreferencesData>({});
  const [dailyGoals, setDailyGoals] = useState<DailyGoals | null>(null);
  const [editGoals, setEditGoals] = useState<Partial<DailyGoals>>({});

  const [showDietTypeModal, setShowDietTypeModal] = useState(false);
  const [showMealFrequencyModal, setShowMealFrequencyModal] = useState(false);

  const goalKeys: (keyof DailyGoals)[] = ["calories", "protein", "carbs", "fats"];

  useEffect(() => {
    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadUserProfile() {
    try {
      setIsLoading(true);
      const userProfile = await getUserProfile();
      const goals = await getDailyGoals();
      setProfile(userProfile);
      setEditProfile({
        username: userProfile.username,
        weight: userProfile.weight,
        height: userProfile.height,
        age: userProfile.age,
        activityLevel: userProfile.activityLevel,
      });
      setPreferences({
        mealFrequency: userProfile.preferences?.mealFrequency,
        snackIncluded: userProfile.preferences?.snackIncluded,
        dietType: userProfile.preferences?.dietType,
        allergies: userProfile.preferences?.allergies,
      });
      setDailyGoals(goals);
      setEditGoals(goals);
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const getDietTypeLabel = (dietType?: string) => {
    const d = dietTypes.find((d) => d.value === dietType);
    return d ? d.label : dietType ?? "Not set";
  };

  const getMealFrequencyLabel = (frequency?: number) => {
    const m = mealFrequencies.find((m) => m.value === frequency);
    return m ? m.label : frequency ? `${frequency} meals per day` : "Not set";
  };

  const handleCancel = () => {
    if (!profile) return;
    setEditProfile({
      username: profile.username,
      weight: profile.weight,
      height: profile.height,
      age: profile.age,
      activityLevel: profile.activityLevel,
    });
    setPreferences({
      mealFrequency: profile.preferences?.mealFrequency,
      snackIncluded: profile.preferences?.snackIncluded,
      dietType: profile.preferences?.dietType,
      allergies: profile.preferences?.allergies,
    });
    setEditGoals(dailyGoals ?? {});
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUserAccount();
              await logout();
              router.replace("/auth/login");
            } catch (err) {
              console.error("Delete account failed:", err);
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!profile) return;
    try {
      setIsSaving(true);

      const hasProfileChanges = Object.keys(editProfile).some(
        (key) =>
          editProfile[key as keyof UpdateProfileData] !== profile?.[key as keyof UserProfile]
      );

      if (hasProfileChanges) {
        await updateUserProfile(editProfile);
      }

      const hasPreferenceChanges = Object.keys(preferences).some(
        (key) =>
          preferences[key as keyof UpdatePreferencesData] !==
          profile?.preferences?.[key as keyof typeof profile.preferences]
      );

      if (hasPreferenceChanges) {
        await updateUserPreferences(preferences);
      }

      const hasGoalChanges = goalKeys.some((key) => editGoals[key] !== dailyGoals?.[key]);

      if (hasGoalChanges) {
        await updateDailyGoals(profile.id, editGoals);
      }

      await loadUserProfile();
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-muted-foreground mt-4">Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background mt-4">
      <ProfileSections
        profile={profile}
        editProfile={editProfile}
        setEditProfile={setEditProfile}
        preferences={preferences}
        setPreferences={setPreferences}
        dailyGoals={dailyGoals}
        editGoals={editGoals}
        setEditGoals={setEditGoals}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        isSaving={isSaving}
        onSave={handleSave}
        onCancel={handleCancel}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
        openDietModal={() => setShowDietTypeModal(true)}
        openMealModal={() => setShowMealFrequencyModal(true)}
        getDietTypeLabel={getDietTypeLabel}
        getMealFrequencyLabel={getMealFrequencyLabel}
      />

      <DietTypeModal
        visible={showDietTypeModal}
        onClose={() => setShowDietTypeModal(false)}
        onSelect={(value) => {
          setPreferences((p) => ({ ...p, dietType: value }));
          setShowDietTypeModal(false);
        }}
        options={dietTypes.map((d) => ({ value: d.value, label: d.label }))}
      />

      <MealFrequencyModal
        visible={showMealFrequencyModal}
        onClose={() => setShowMealFrequencyModal(false)}
        onSelect={(value) => {
          setPreferences((p) => ({ ...p, mealFrequency: value }));
          setShowMealFrequencyModal(false);
        }}
        options={mealFrequencies.map((m) => ({ value: m.value, label: m.label }))}
      />
    </ScrollView>
  );
}
