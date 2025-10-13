import { View, Text } from "react-native";

export default function MessageBubble({ message }: any) {
  const isUser = message.sender === "user";
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View className={`flex mb-3 ${isUser ? "items-end" : "items-start"}`}>
      <View
        className={`max-w-[85%] p-3 rounded-2xl ${isUser ? "bg-green-500" : "bg-gray-200 dark:bg-neutral-800"}`}
      >
        {message.content.split("\n").map((line: string, index: number) => (
          <Text
            key={index}
            className={`${isUser ? "text-white" : "text-black dark:text-white"} mb-1`}
          >
            {line.trim()}
          </Text>
        ))}
        <Text className={`text-xs mt-1 ${isUser ? "text-green-100" : "text-gray-400"}`}>{time}</Text>
      </View>
    </View>
  );
}
