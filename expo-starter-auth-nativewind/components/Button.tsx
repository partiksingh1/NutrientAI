import { LucideIcon } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

type Props = {
  label?: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "danger" | "outline";
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  size?: "sm" | "md" | "lg";
};

export default function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  fullWidth = true,
  loading = false,
  icon: Icon,
  size = "md",
}: Props) {
  const getBackgroundColor = () => {
    if (disabled || loading) return "bg-green-500";

    switch (variant) {
      case "primary":
        return "bg-green-600";
      case "secondary":
        return "bg-gray-600";
      case "danger":
        return "bg-red-600";
      case "outline":
        return "bg-transparent border border-gray-300";
      default:
        return "bg-green-600";
    }
  };

  const getTextColor = () => {
    if (disabled || loading) return "text-gray-500";

    switch (variant) {
      case "outline":
        return "text-gray-700";
      default:
        return "text-white";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "py-2 px-4";
      case "lg":
        return "py-3 px-4";
      default:
        return "py-3 px-6";
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "lg":
        return "text-lg";
      default:
        return "text-base";
    }
  };

  return (
    <Pressable
      className={`
        rounded-lg items-center justify-center flex-row
        ${getBackgroundColor()}
        ${getSizeClasses()}
        ${fullWidth ? "w-full" : ""}
        ${disabled || loading ? "opacity-70" : ""}
      `}
      onPress={disabled || loading ? undefined : onPress}
      disabled={disabled || loading}
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
      })}
    >
      {loading ? (
        <View className="flex-row items-center">
          <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </View>
      ) : (
        <View className="flex-row items-center">
          {Icon && (
            <Icon size={16} color={variant === "outline" ? "#374151" : "white"} className="mr-2" />
          )}
          <Text className={`${getTextColor()} font-semibold ${getTextSize()}`}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}
