import React, { ReactNode } from "react";
import { View, Text } from "react-native";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <View
      className={`bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-800 ${
        className || ""
      }`}
    >
      {children}
    </View>
  );
}

type CardHeaderProps = {
  children: ReactNode;
  className?: string;
};

export function CardHeader({ children, className }: CardHeaderProps) {
  return <View className={`px-4 pt-4 ${className || ""}`}>{children}</View>;
}

type CardContentProps = {
  children: ReactNode;
  className?: string;
};

export function CardContent({ children, className }: CardContentProps) {
  return <View className={`px-4 pb-4 ${className || ""}`}>{children}</View>;
}

type CardTitleProps = {
  children: ReactNode;
  className?: string;
};

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <Text className={`text-base font-medium text-gray-900 dark:text-gray-100 ${className || ""}`}>
      {children}
    </Text>
  );
}
