import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';
import { TrendingUp, TrendingDown, Target, Award, Zap } from 'lucide-react-native';
import { Card } from '@/components/Card';

export default function ProgressScreen() {
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('week');

    // Mock data for charts
    const weightData = [
        { value: 72.5, label: 'Dec 1' },
        { value: 72.3, label: 'Dec 2' },
        { value: 72.1, label: 'Dec 3' },
        { value: 71.9, label: 'Dec 4' },
        { value: 71.8, label: 'Dec 5' },
    ];

    const macroData = [
        { protein: 110, carbs: 200, fats: 75, label: 'Dec 1' },
        { protein: 95, carbs: 180, fats: 65, label: 'Dec 2' },
        { protein: 120, carbs: 220, fats: 85, label: 'Dec 3' },
        { protein: 105, carbs: 190, fats: 70, label: 'Dec 4' },
        { protein: 95, carbs: 180, fats: 65, label: 'Dec 5' },
    ];

    const adherenceData = [
        { value: 75, color: '#22c55e', label: 'On Track' },
        { value: 20, color: '#f59e0b', label: 'Close' },
        { value: 5, color: '#ef4444', label: 'Missed' },
    ];

    const stats = [
        { label: 'Weight Lost', value: '0.7 kg', change: '-2.3%', positive: true, icon: TrendingDown },
        { label: 'Avg Calories', value: '1,996', change: '+5.2%', positive: false, icon: Zap },
        { label: 'Goal Adherence', value: '89%', change: '+12%', positive: true, icon: Target },
    ];

    const achievements = [
        { title: '7-Day Streak', description: 'Logged meals for 7 days straight!', earned: true },
        { title: 'Protein Pro', description: 'Hit protein goals 5 days this week', earned: true },
        { title: 'Balanced Week', description: 'Maintained macro balance', earned: false },
        { title: 'Hydration Hero', description: 'Drink 8 glasses daily for a week', earned: false },
    ];

    return (
        <ScrollView className="flex-1 bg-background mt-4">
            {/* Header */}
            <View className="p-6 pb-4">
                <Text className="text-2xl mb-1 font-semibold">Progress Tracking</Text>
                <Text className="text-lg text-muted-foreground">Your nutrition journey over time</Text>
            </View>

            {/* Period Selector */}
            <View className="px-6 mb-6 flex-row gap-2">
                {['week', 'month', 'quarter'].map((period) => (
                    <Pressable
                        key={period}
                        className={`px-3 py-1.5 rounded-full border ${selectedPeriod === period ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                            }`}
                        onPress={() => setSelectedPeriod(period as any)}
                    >
                        <Text
                            className={`text-sm capitalize ${selectedPeriod === period ? 'text-white' : 'text-gray-700'
                                }`}
                        >
                            {period}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Stats Overview */}
            <View className="px-6 mb-6 flex-row justify-between">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className="flex-1 mx-1 p-3 items-center">
                            <Icon size={20} color={stat.positive ? '#16a34a' : '#ef4444'} />
                            <Text className="text-lg mt-1">{stat.value}</Text>
                            <Text className="text-xs text-gray-500">{stat.label}</Text>
                            <Text
                                className={`text-xs mt-1 ${stat.positive ? 'text-green-600' : 'text-red-600'
                                    }`}
                            >
                                {stat.change}
                            </Text>
                        </Card>
                    );
                })}
            </View>

            {/* Weight Chart */}
            <View className="px-6 mb-6">
                <Card className="p-4">
                    <Text className="text-base font-medium mb-3">Weight Progress</Text>
                    <LineChart
                        data={weightData}
                        width={300}
                        height={150}
                        color="#3b82f6"
                        yAxisLabelSuffix="kg"
                    />
                    <View className="flex-row justify-between mt-2">
                        <Text className="text-xs text-gray-500">Start: 72.5kg</Text>
                        <Text className="text-xs text-gray-500">Current: 71.8kg</Text>
                    </View>
                </Card>
            </View>

            {/* Achievements */}
            <View className="px-6 pb-6">
                <Card className="p-4">
                    <Text className="text-base font-medium mb-3">Achievements</Text>
                    {achievements.map((ach, index) => (
                        <View
                            key={index}
                            className={`flex-row items-center gap-3 p-3 mb-2 rounded-lg border ${ach.earned
                                ? 'border-green-200 bg-green-50'
                                : 'border-gray-300 bg-gray-100'
                                }`}
                        >
                            <View
                                className={`w-10 h-10 rounded-full items-center justify-center ${ach.earned ? 'bg-green-500' : 'bg-gray-300'
                                    }`}
                            >
                                <Award size={20} color={ach.earned ? '#fff' : '#6b7280'} />
                            </View>
                            <View className="flex-1">
                                <Text className={`text-sm ${ach.earned ? '' : 'text-gray-500'}`}>
                                    {ach.title}
                                </Text>
                                <Text className="text-xs text-gray-500">{ach.description}</Text>
                            </View>
                            {ach.earned && <Text className="text-green-600 text-xs">✓</Text>}
                        </View>
                    ))}
                </Card>
            </View>
        </ScrollView>
    );
}
