import { View, Text, ActivityIndicator } from "react-native";

export default function TypingIndicator() {
  return (
    <View style={{ alignItems: "flex-start", marginVertical: 8 }}>
      <View
        style={{
          backgroundColor: "#E5E7EB", // Tailwind gray-200
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: 16,
          flexDirection: "row",
          alignItems: "center",
          maxWidth: "80%",
        }}
      >
        <ActivityIndicator size="small" color="#6B7280" />
      </View>
    </View>
  );
}
