import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { User, Bell, Palette, HelpCircle, LogOut, Edit, Save, X, User2Icon, Trash2 } from 'lucide-react-native';
import AuthService from '@/services/authService';
import UserService, { UserProfile, UpdateProfileData, UpdatePreferencesData } from '@/services/userService';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editProfile, setEditProfile] = useState<UpdateProfileData>({});
  const [preferences, setPreferences] = useState<UpdatePreferencesData>({});
  const { user, logout } = useAuth();
  const router = useRouter();

  // Load user profile on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const userProfile = await UserService.getUserProfile();
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
        await UserService.updateUserProfile(editProfile);
      }

      // Update preferences if there are changes
      const hasPreferenceChanges = Object.keys(preferences).some(key =>
        preferences[key as keyof UpdatePreferencesData] !== profile?.preferences?.[key as keyof typeof profile.preferences]
      );

      if (hasPreferenceChanges) {
        await UserService.updateUserPreferences(preferences);
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
              await UserService.deleteUserAccount();
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

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-muted-foreground mt-4">Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted-foreground">Failed to load profile</Text>
      </View>
    );
  }

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
              <Text className="text-xl">{profile.username}</Text>
              <Text className="text-sm text-muted-foreground">{profile.email}</Text>
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
                <Text className="text-sm mt-1">{profile.username}</Text>
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
                <Text className="text-sm mt-1">{profile.age ? `${profile.age} years` : 'Not set'}</Text>
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
                <Text className="text-sm mt-1">{profile.weight ? `${profile.weight} kg` : 'Not set'}</Text>
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
                <Text className="text-sm mt-1">{profile.height ? `${profile.height} cm` : 'Not set'}</Text>
              )}
            </View>
          </View>

          {/* Activity Level & Gender */}
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-xs text-muted-foreground">Activity Level</Text>
              <Text className="text-sm mt-1 capitalize">{profile.activityLevel || 'Not set'}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-muted-foreground">Gender</Text>
              <Text className="text-sm mt-1 capitalize">{profile.gender || 'Not set'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Preferences */}
      <View className="px-6 mb-6">
        <View className="bg-card rounded-xl p-4 border border-gray-300">
          <View className="flex-row items-center gap-2 mb-3">
            <Palette size={18} color="black" />
            <Text className="text-base">Preferences</Text>
          </View>

          {/* Diet Type */}
          <View className="mb-4">
            <Text className="text-xs text-muted-foreground">Diet Type</Text>
            <Text className="text-sm mt-1 capitalize">{profile.preferences?.dietType?.replace('_', ' ').toLowerCase() || 'Not set'}</Text>
          </View>

          {/* Meal Frequency */}
          <View className="mb-4">
            <Text className="text-xs text-muted-foreground">Meals per Day</Text>
            <Text className="text-sm mt-1">{profile.preferences?.mealFrequency || 'Not set'}</Text>
          </View>

          {/* Snack Included */}
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-sm">Include Snacks</Text>
            <Switch
              value={profile.preferences?.snackIncluded || false}
              onValueChange={(checked) => setPreferences((p) => ({ ...p, snackIncluded: checked }))}
              disabled={!isEditing}
            />
          </View>

          {/* Allergies */}
          <View className="mt-4">
            <Text className="text-xs text-muted-foreground">Allergies</Text>
            <Text className="text-sm mt-1">{profile.preferences?.allergies || 'None'}</Text>
          </View>
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
    </ScrollView>
  );
}
