import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator, Modal, FlatList } from 'react-native';
import { User, Palette, HelpCircle, LogOut, Edit, Save, X, User2Icon, Trash2, ChevronDown } from 'lucide-react-native';
import { UserProfile, UpdateProfileData, UpdatePreferencesData, getUserProfile, updateUserProfile, updateUserPreferences, deleteUserAccount, DailyGoals, getDailyGoals, updateDailyGoals } from '@/services/userService';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editProfile, setEditProfile] = useState<UpdateProfileData>({});
  const [preferences, setPreferences] = useState<UpdatePreferencesData>({});
  const [showDietTypeModal, setShowDietTypeModal] = useState(false);
  const [showMealFrequencyModal, setShowMealFrequencyModal] = useState(false);
  const [dailyGoals, setDailyGoals] = useState<DailyGoals | null>(null);
  const [editGoals, setEditGoals] = useState<Partial<DailyGoals>>({});
  const goalKeys: (keyof DailyGoals)[] = ['calories', 'protein', 'carbs', 'fats'];
  const { logout } = useAuth();
  const router = useRouter();

  // Diet type options
  const dietTypes = [
    { value: 'OMNIVORE', label: 'Omnivore' },
    { value: 'VEGETARIAN', label: 'Vegetarian' },
    { value: 'VEGAN', label: 'Vegan' },
    { value: 'KETO', label: 'Keto' },
    { value: 'PALEO', label: 'Paleo' },
    { value: 'GLUTEN_FREE', label: 'Gluten Free' },
    { value: 'OTHER', label: 'Other' },
  ];

  // Meal frequency options
  const mealFrequencies = [
    { value: 1, label: '1 meal per day' },
    { value: 2, label: '2 meals per day' },
    { value: 3, label: '3 meals per day' },
    { value: 4, label: '4 meals per day' },
    { value: 5, label: '5 meals per day' },
    { value: 6, label: '6 meals per day' },
  ];

  // Load user profile on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
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
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Update profile if there are changes
      const hasProfileChanges = Object.keys(editProfile).some(key =>
        editProfile[key as keyof UpdateProfileData] !== profile?.[key as keyof UserProfile]
      );

      if (hasProfileChanges) {
        await updateUserProfile(editProfile);
      }

      // Update preferences if there are changes
      const hasPreferenceChanges = Object.keys(preferences).some(key =>
        preferences[key as keyof UpdatePreferencesData] !== profile?.preferences?.[key as keyof typeof profile.preferences]
      );

      if (hasPreferenceChanges) {
        await updateUserPreferences(preferences);
      }

      const hasGoalChanges = goalKeys.some(key =>
        editGoals[key] !== dailyGoals?.[key]
      );

      if (hasGoalChanges && profile) {
        await updateDailyGoals(profile.id, editGoals);
      }

      // Reload profile to get updated data
      await loadUserProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
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
    }
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUserAccount();
              await logout();
              router.replace("/auth/login");
            } catch (error) {
              console.error("Delete account failed:", error);
            }
          },
        },
      ]
    );
  };

  const getDietTypeLabel = (dietType: string) => {
    const diet = dietTypes.find(d => d.value === dietType);
    return diet ? diet.label : dietType;
  };

  const getMealFrequencyLabel = (frequency: number) => {
    const meal = mealFrequencies.find(m => m.value === frequency);
    return meal ? meal.label : `${frequency} meals per day`;
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-muted-foreground mt-4">Loading profile...</Text>
      </View>
    );
  }

  // if (!profile) {
  //   return (
  //     <View className="flex-1 bg-background items-center justify-center">
  //       <Text className="text-muted-foreground">Failed to load profile</Text>
  //     </View>
  //   );
  // }

  return (
    <ScrollView className="flex-1 bg-background mt-4">
      {/* Header */}
      <View className="p-6 pb-4">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center gap-4">
            <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center">
              <User2Icon size={18} color="white" />
            </View>
            <View>
              <Text className="text-xl">{profile?.username}</Text>
              <Text className="text-sm text-muted-foreground">{profile?.email}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={isEditing ? handleCancel : () => setIsEditing(true)}
            className="px-3 py-2 border rounded-md border-gray-300 flex-row items-center gap-2"
          >
            {isEditing ? <X size={16} color="black" /> : <Edit size={16} color="black" />}
            <Text>{isEditing ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Info */}
      <View className="px-6 mb-6">
        <View className="bg-card rounded-xl p-4 border border-gray-300">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <User size={18} color="black" />
              <Text className="text-base">Personal Information</Text>
            </View>
            {isEditing && (
              <TouchableOpacity
                onPress={handleSave}
                disabled={isSaving}
                className="px-2 py-1 bg-primary rounded-md flex-row items-center gap-1"
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Save size={14} color="black" />
                    <Text className="text-sm">Save</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Username & Age */}
          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <Text className="text-xs text-muted-foreground">Username</Text>
              {isEditing ? (
                <TextInput
                  className="border border-border rounded-md px-2 py-1 mt-1"
                  value={editProfile.username || ''}
                  onChangeText={(text) => setEditProfile((p) => ({ ...p, username: text }))}
                />
              ) : (
                <Text className="text-sm mt-1">{profile?.username}</Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-xs text-muted-foreground">Age</Text>
              {isEditing ? (
                <TextInput
                  className="border border-border rounded-md px-2 py-1 mt-1"
                  keyboardType="numeric"
                  value={editProfile.age?.toString() || ''}
                  onChangeText={(text) => setEditProfile((p) => ({ ...p, age: parseInt(text) || undefined }))}
                />
              ) : (
                <Text className="text-sm mt-1">{profile?.age ? `${profile.age} years` : 'Not set'}</Text>
              )}
            </View>
          </View>

          {/* Weight & Height */}
          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <Text className="text-xs text-muted-foreground">Weight (kg)</Text>
              {isEditing ? (
                <TextInput
                  className="border border-border rounded-md px-2 py-1 mt-1"
                  keyboardType="numeric"
                  value={editProfile.weight?.toString() || ''}
                  onChangeText={(text) => setEditProfile((p) => ({ ...p, weight: parseFloat(text) || undefined }))}
                />
              ) : (
                <Text className="text-sm mt-1">{profile?.weight ? `${profile.weight} kg` : 'Not set'}</Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-xs text-muted-foreground">Height (cm)</Text>
              {isEditing ? (
                <TextInput
                  className="border border-border rounded-md px-2 py-1 mt-1"
                  keyboardType="numeric"
                  value={editProfile.height?.toString() || ''}
                  onChangeText={(text) => setEditProfile((p) => ({ ...p, height: parseFloat(text) || undefined }))}
                />
              ) : (
                <Text className="text-sm mt-1">{profile?.height ? `${profile.height} cm` : 'Not set'}</Text>
              )}
            </View>
          </View>

          {/* Activity Level & Gender */}
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-xs text-muted-foreground">Activity Level</Text>
              <Text className="text-sm mt-1 capitalize">{profile?.activityLevel || 'Not set'}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-muted-foreground">Gender</Text>
              <Text className="text-sm mt-1 capitalize">{profile?.gender || 'Not set'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Preferences */}
      <View className="px-6 mb-6">
        <View className="bg-card rounded-xl p-4 border border-gray-300">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <Palette size={18} color="black" />
              <Text className="text-base">Preferences</Text>
            </View>
            {isEditing && (
              <TouchableOpacity
                onPress={handleSave}
                disabled={isSaving}
                className="px-2 py-1 bg-primary rounded-md flex-row items-center gap-1"
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Save size={14} color="black" />
                    <Text className="text-sm">Save</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Diet Type */}
          <View className="mb-4">
            <Text className="text-xs text-muted-foreground mb-2">Diet Type</Text>
            {isEditing ? (
              <TouchableOpacity
                onPress={() => setShowDietTypeModal(true)}
                className="border border-border rounded-md px-3 py-2 flex-row items-center justify-between"
              >
                <Text className="text-sm">
                  {preferences.dietType ? getDietTypeLabel(preferences.dietType) :
                    profile?.preferences?.dietType ? getDietTypeLabel(profile.preferences.dietType) :
                      'Select diet type'}
                </Text>
                <ChevronDown size={16} color="gray" />
              </TouchableOpacity>
            ) : (
              <Text className="text-sm mt-1">
                {profile?.preferences?.dietType ? getDietTypeLabel(profile.preferences.dietType) : 'Not set'}
              </Text>
            )}
          </View>

          {/* Meal Frequency */}
          <View className="mb-4">
            <Text className="text-xs text-muted-foreground mb-2">Meals per Day</Text>
            {isEditing ? (
              <TouchableOpacity
                onPress={() => setShowMealFrequencyModal(true)}
                className="border border-border rounded-md px-3 py-2 flex-row items-center justify-between"
              >
                <Text className="text-sm">
                  {preferences.mealFrequency ? getMealFrequencyLabel(preferences.mealFrequency) :
                    profile?.preferences?.mealFrequency ? getMealFrequencyLabel(profile.preferences.mealFrequency) :
                      'Select meal frequency'}
                </Text>
                <ChevronDown size={16} color="gray" />
              </TouchableOpacity>
            ) : (
              <Text className="text-sm mt-1">
                {profile?.preferences?.mealFrequency ? getMealFrequencyLabel(profile.preferences.mealFrequency) : 'Not set'}
              </Text>
            )}
          </View>

          {/* Snack Included */}
          <View className="flex-row items-center justify-between py-2 mb-4">
            <Text className="text-sm">Include Snacks</Text>
            <Switch
              value={preferences.snackIncluded !== undefined ? preferences.snackIncluded : (profile?.preferences?.snackIncluded || false)}
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
                value={preferences.allergies !== undefined ? preferences.allergies : (profile?.preferences?.allergies || '')}
                onChangeText={(text) => setPreferences((p) => ({ ...p, allergies: text }))}
                multiline
                numberOfLines={2}
              />
            ) : (
              <Text className="text-sm mt-1">
                {profile?.preferences?.allergies || 'None'}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Daily Goals Section */}
      <View className="px-6 mb-6">
        <View className="bg-card rounded-xl p-4 border border-gray-300">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <Palette size={18} color="black" />
              <Text className="text-base">Daily Nutritional Goals</Text>
            </View>
            {isEditing && (
              <TouchableOpacity
                onPress={handleSave}
                disabled={isSaving}
                className="px-2 py-1 bg-primary rounded-md flex-row items-center gap-1"
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Save size={14} color="black" />
                    <Text className="text-sm">Save</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {goalKeys.map((key) => (
            <View key={key} className="mb-4">
              <Text className="text-xs text-muted-foreground capitalize">{key}</Text>
              {isEditing ? (
                <TextInput
                  className="border border-border rounded-md px-2 py-1 mt-1"
                  keyboardType="numeric"
                  value={editGoals?.[key] !== undefined ? editGoals[key]?.toString() : ''}
                  onChangeText={(text) =>
                    setEditGoals((prev) => ({
                      ...prev,
                      [key]: parseInt(text) || 0,
                    }))
                  }
                />
              ) : (
                <Text className="text-sm mt-1">{dailyGoals?.[key]} {key === 'calories' ? 'kcal' : 'g'}</Text>
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
          <TouchableOpacity className="flex-row items-center gap-3 p-4" onPress={handleLogout}>
            <LogOut size={18} color="red" />
            <Text className="text-sm text-red-500">Sign Out</Text>
          </TouchableOpacity>
          <View className="h-[1px] bg-border" />
          <TouchableOpacity className="flex-row items-center gap-3 p-4" onPress={handleDeleteAccount}>
            <Trash2 size={18} color="red" />
            <Text className="text-sm text-red-500">Delete Account</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Diet Type Modal */}
      <Modal
        visible={showDietTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDietTypeModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-96">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold">Select Diet Type</Text>
              <TouchableOpacity onPress={() => setShowDietTypeModal(false)}>
                <X size={24} color="gray" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={dietTypes}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setPreferences((p) => ({ ...p, dietType: item.value }));
                    setShowDietTypeModal(false);
                  }}
                  className="py-3 px-4 border-b border-gray-100"
                >
                  <Text className="text-base">{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Meal Frequency Modal */}
      <Modal
        visible={showMealFrequencyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMealFrequencyModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-96">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold">Select Meal Frequency</Text>
              <TouchableOpacity onPress={() => setShowMealFrequencyModal(false)}>
                <X size={24} color="gray" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={mealFrequencies}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setPreferences((p) => ({ ...p, mealFrequency: item.value }));
                    setShowMealFrequencyModal(false);
                  }}
                  className="py-3 px-4 border-b border-gray-100"
                >
                  <Text className="text-base">{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
