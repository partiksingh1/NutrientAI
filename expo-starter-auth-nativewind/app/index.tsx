import { useRouter } from "expo-router";
import { Alert, Text, View } from "react-native";

import Button from "@/components/Button";

export default function Index() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center gap-y-2">
      <View className="items-center">
        <Text className="text-4xl">Welcome to NativeWind!</Text>
        <Text className="text-xl">Style your app with</Text>
        <Text className="text-3xl bg-yellow-100 font-bold underline">Tailwind CSS!</Text>
      </View>
      <Button
        label="Sounds good!"
        onPress={() => {
          router.replace("/OnBoarding/onboarding");
          Alert.alert("NativeWind", "You're all set up!");
        }}
      />
    </View>
  );
}
