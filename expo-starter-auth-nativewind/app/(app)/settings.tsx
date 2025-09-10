import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { User, Target, Bell, Palette, HelpCircle, LogOut, Edit, Save, X, User2Icon } from 'lucide-react-native';

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    age: '28',
    weight: '71.8',
    height: '175',
    activityLevel: 'moderate',
    goal: 'fat-loss',
    dietType: 'omnivore',
    allergies: ['Nuts', 'Dairy'],
  });

  const [editProfile, setEditProfile] = useState(profile);
  const [notifications, setNotifications] = useState({
    mealReminders: true,
    progressUpdates: true,
    achievements: true,
    weeklyReports: false,
  });

  const handleSave = () => {
    setProfile(editProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditProfile(profile);
    setIsEditing(false);
  };

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
              <Text className="text-xl">{profile.name}</Text>
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
                className="px-2 py-1 bg-primary rounded-md flex-row items-center gap-1"
              >
                <Save size={14} color="#fff" />
                <Text className="text-white text-sm">Save</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Name & Age */}
          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <Text className="text-xs text-muted-foreground">Name</Text>
              {isEditing ? (
                <TextInput
                  className="border border-border rounded-md px-2 py-1 mt-1"
                  value={editProfile.name}
                  onChangeText={(text) => setEditProfile((p) => ({ ...p, name: text }))}
                />
              ) : (
                <Text className="text-sm mt-1">{profile.name}</Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-xs text-muted-foreground">Age</Text>
              {isEditing ? (
                <TextInput
                  className="border border-border rounded-md px-2 py-1 mt-1"
                  keyboardType="numeric"
                  value={editProfile.age}
                  onChangeText={(text) => setEditProfile((p) => ({ ...p, age: text }))}
                />
              ) : (
                <Text className="text-sm mt-1">{profile.age} years</Text>
              )}
            </View>
          </View>

          {/* Weight & Height */}
          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <Text className="text-xs text-muted-foreground">Weight</Text>
              {isEditing ? (
                <TextInput
                  className="border border-border rounded-md px-2 py-1 mt-1"
                  keyboardType="numeric"
                  value={editProfile.weight}
                  onChangeText={(text) => setEditProfile((p) => ({ ...p, weight: text }))}
                />
              ) : (
                <Text className="text-sm mt-1">{profile.weight} kg</Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-xs text-muted-foreground">Height</Text>
              {isEditing ? (
                <TextInput
                  className="border border-border rounded-md px-2 py-1 mt-1"
                  keyboardType="numeric"
                  value={editProfile.height}
                  onChangeText={(text) => setEditProfile((p) => ({ ...p, height: text }))}
                />
              ) : (
                <Text className="text-sm mt-1">{profile.height} cm</Text>
              )}
            </View>
          </View>

          {/* Activity Level */}
          <View>
            <Text className="text-xs text-muted-foreground">Activity Level</Text>
            <Text className="text-sm mt-1 capitalize">{profile.activityLevel}</Text>
            {/* You can replace this with a dropdown/picker if editing */}
          </View>
        </View>
      </View>

      {/* Notifications */}
      <View className="px-6 mb-6">
        <View className="bg-card rounded-xl p-4 border border-gray-300">
          <View className="flex-row items-center gap-2 mb-3">
            <Bell size={18} color="black" />
            <Text className="text-base">Notifications</Text>
          </View>
          {Object.entries(notifications).map(([key, value]) => (
            <View key={key} className="flex-row items-center justify-between py-2">
              <Text className="text-sm">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
              </Text>
              <Switch
                value={value}
                onValueChange={(checked) => setNotifications((p) => ({ ...p, [key]: checked }))}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Settings */}
      <View className="px-6 pb-6">
        <View className="bg-card rounded-xl border border-gray-300">
          <TouchableOpacity className="flex-row items-center gap-3 p-4">
            <Palette size={18} color="black" />
            <Text className="text-sm">Theme & Appearance</Text>
          </TouchableOpacity>
          <View className="h-[1px] bg-border" />
          <TouchableOpacity className="flex-row items-center gap-3 p-4">
            <HelpCircle size={18} color="black" />
            <Text className="text-sm">Help & Support</Text>
          </TouchableOpacity>
          <View className="h-[1px] bg-border" />
          <TouchableOpacity className="flex-row items-center gap-3 p-4">
            <LogOut size={18} color="red" />
            <Text className="text-sm text-red-500">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
