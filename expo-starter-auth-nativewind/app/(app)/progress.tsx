import { Target, Zap, Activity } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-gifted-charts";

import { Card } from "@/components/Card";
import { useAnalytics, Period } from "@/hooks/useAnalytics";
import { i18n } from "@/lib/i18next";

export default function ProgressScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("week");
  const { analytics, loading, error, refetch } = useAnalytics(selectedPeriod);
  const [chartType, setChartType] = useState<"bar" | "line">("line");

  const toggleChart = () => {
    setChartType(prev => (prev === "bar" ? "line" : "bar"));
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading && !analytics) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="green" accessibilityLabel="Loading indicator" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background justify-center items-center p-6">
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <Pressable onPress={refetch} className="bg-green-600 px-4 py-2 rounded-lg">
          <Text className="text-white">{i18n.t("progress.headerTitle")}</Text>
        </Pressable>
      </View>
    );
  }

  if (!analytics) {
    return (
      <View className="flex-1 bg-background justify-center items-center p-6">
        <Text className="text-gray-500 text-center">{i18n.t("progress.noData")}</Text>
      </View>
    );
  }

  const nutritionChartData = analytics.dailyTotals.map(day => ({
    value: day.calories,
    label: formatDate(day.date),
    frontColor: "#3b82f6",
  }));
  const maxCalories = Math.max(...nutritionChartData.map(d => d.value), 2000);

  const macroChartData = analytics.macroDistribution.map(macro => ({
    value: macro.value,
    color: macro.color,
    label: macro.label,
  }));

  const stats = [
    {
      label: `${i18n.t("progress.stats.avgCalories")}`,
      value: formatNumber(analytics.stats.avgCalories),
      icon: Zap,
      color: "#3b82f6",
    },
    {
      label: `${i18n.t("progress.stats.goalAdherence")}`,
      value: `${analytics.stats.adherence}%`,
      icon: Target,
      color: analytics.stats.adherence >= 80 ? "#16a34a" : "#f59e0b",
    },
    {
      label: `${i18n.t("progress.stats.totalMeals")}`,
      value: formatNumber(analytics.stats.totalMeals),
      icon: Activity,
      color: "#8b5cf6",
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
    >
      {/* Header */}
      <View className="p-6 pb-4">
        <Text className="text-2xl mb-1 font-semibold">{i18n.t("progress.headerTitle")}</Text>
        <Text className="text-lg text-muted-foreground">{i18n.t("progress.headerSubtitle")}</Text>
      </View>

      {/* Period Selector */}
      <View className="px-6 mb-6 flex-row gap-2">
        {([`${i18n.t("progress.period.week")}`, `${i18n.t("progress.period.month")}`, `${i18n.t("progress.period.quarter")}`] as Period[]).map(period => (
          <Pressable
            key={period}
            className={`px-4 py-2 rounded-full border ${selectedPeriod === period ? "bg-green-600 border-green-600" : "border-gray-300 bg-white"
              }`}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              className={`text-sm capitalize font-medium ${selectedPeriod === period ? "text-white" : "text-gray-700"
                }`}
            >
              {period}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Stats Overview */}
      <View className="px-6 mb-6">
        <View className="flex-row justify-between gap-2">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="flex-1 p-4 items-center">
                <Icon size={24} color={stat.color} />
                <Text className="text-xl font-bold mt-2">{stat.value}</Text>
                <Text className="text-xs text-gray-500 text-center mt-1">{stat.label}</Text>
              </Card>
            );
          })}
        </View>
      </View>

      {/* Nutrition Trends Chart */}
      {nutritionChartData.length > 0 ? (
        <View className="px-6 mb-6">
          <Card className="p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-base font-medium">{i18n.t("progress.trends.dailyCalories")}</Text>
              <Pressable onPress={toggleChart} className="px-3 py-1 bg-gray-100 rounded-full">
                <Text className="text-xs text-green-600 font-medium">
                  {i18n.t("progress.trends.switchTo")} {chartType === "bar" ? "Line" : "Bar"}
                </Text>
              </Pressable>
            </View>

            {chartType === "bar" ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={nutritionChartData}
                  barWidth={26}
                  barBorderRadius={2}
                  showValuesAsTopLabel
                  spacing={12}
                  noOfSections={3}
                  xAxisLabelTextStyle={{
                    fontSize: 9,
                    marginTop: 4,
                  }}
                  yAxisTextStyle={{
                    fontSize: 10,
                  }}
                  initialSpacing={10}
                  maxValue={maxCalories}
                  width={nutritionChartData.length * (26 + 18) + 40} // calculated width
                />
              </ScrollView>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                  data={nutritionChartData}
                  width={Dimensions.get("window").width - 64}
                  height={220}
                  yAxisLabelSuffix=""
                  isAnimated
                  animationDuration={600}
                  color="#3b82f6"
                  hideDataPoints={false}
                  dataPointsColor="#2563eb"
                  textColor="#3b82f6"
                  areaChart
                  curved
                  xAxisLabelTextStyle={{
                    color: "#6b7280",
                    fontSize: 10,
                    marginTop: 4,
                  }}
                  yAxisTextStyle={{
                    color: "#6b7280",
                    fontSize: 10,
                  }}
                  noOfSections={4}
                  maxValue={maxCalories}
                />
              </ScrollView>
            )}
          </Card>
        </View>
      ) : (
        <View className="px-6 mb-6">
          <Card className="p-6 items-center">
            <Text className="text-sm text-gray-500 text-center">
              {i18n.t("progress.trends.notEnoughData")}
            </Text>
          </Card>
        </View>
      )}

      {/* Macro Distribution */}
      {macroChartData.length > 0 && (
        <View className="px-6 mb-6">
          <Card className="p-4">
            <Text className="text-base font-medium mb-3">{i18n.t("progress.macros.title")}</Text>
            <View className="items-center">
              <PieChart
                data={macroChartData}
                radius={80}
                innerRadius={40}
                centerLabelComponent={() => <Text className="text-lg font-bold">Macros</Text>}
              />
            </View>
            <View className="flex-row justify-around mt-4">
              {macroChartData.map((macro, index) => (
                <View key={index} className="items-center">
                  <View
                    className="w-3 h-3 rounded-full mb-1"
                    style={{ backgroundColor: macro.color }}
                  />
                  <Text className="text-xs text-gray-600">{macro.label}</Text>
                  <Text className="text-xs font-medium">{macro.value}%</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>
      )}

      {/* Summary Stats */}
      <View className="px-6 pb-6">
        <Card className="p-4">
          <Text className="text-base font-medium mb-3">{i18n.t("progress.summary.title")}</Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">{i18n.t("progress.summary.loggedDays")}</Text>
              <Text className="text-sm font-medium">{analytics.stats.loggedDays}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">{i18n.t("progress.summary.avgProtein")}</Text>
              <Text className="text-sm font-medium">
                {formatNumber(analytics.stats.avgProtein)}g
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">{i18n.t("progress.summary.avgCarbs")}</Text>
              <Text className="text-sm font-medium">{formatNumber(analytics.stats.avgCarbs)}g</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">{i18n.t("progress.summary.avgFats")}</Text>
              <Text className="text-sm font-medium">{formatNumber(analytics.stats.avgFats)}g</Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
