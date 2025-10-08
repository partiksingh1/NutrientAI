import { TouchableOpacity } from "react-native";

export default function Button({
  variant = "default",
  size = "md",
  disabled = false,
  onPress,
  children,
  className = "",
}: any) {
  const base = "flex-row items-center justify-center rounded-xl px-4";
  const sizes: any = {
    sm: "h-8",
    md: "h-12",
    icon: "h-12 w-12",
  };
  const styles =
    variant === "default"
      ? "bg-blue-500"
      : variant === "outline"
        ? "border border-gray-300"
        : "bg-transparent";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${styles} ${disabled ? "opacity-50" : ""} ${className}`}
    >
      {children}
    </TouchableOpacity>
  );
}
