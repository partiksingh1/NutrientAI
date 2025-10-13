// app/meals/_layout.tsx
import { Stack } from "expo-router";

export default function MealsLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false, // or set title: "All Logged Meals"
                }}
            />
        </Stack>
    );
}
