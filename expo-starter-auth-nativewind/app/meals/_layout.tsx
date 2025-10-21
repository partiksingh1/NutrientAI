// app/meals/_layout.tsx
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MealsLayout() {
    return (
        <SafeAreaView edges={{
            top: "maximum"
        }} style={{ flex: 1, backgroundColor: "#f9fafb", margin: 0, padding: 0 }}>
            <Stack>
                <Stack.Screen
                    name="index"
                    options={{
                        headerShown: false, // or set title: "All Logged Meals"
                    }}
                />
            </Stack>
        </SafeAreaView>
    );
}
