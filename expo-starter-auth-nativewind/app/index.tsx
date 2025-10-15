import React from "react";
import {
    SafeAreaView,
    StatusBar,
    View,
    Text,
    Image,
    useWindowDimensions,
    TouchableOpacity,
    Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/Button";

export default function Index() {
    const router = useRouter();
    const { isAuthenticated, isProfileComplete, isLoading } = useAuth();
    const { width } = useWindowDimensions();

    const handlePress = () => {
        if (isLoading) return;

        if (isAuthenticated && isProfileComplete) {
            router.replace("/(app)");
        } else if (isAuthenticated && !isProfileComplete) {
            router.replace("/OnBoarding/onboarding");
        } else {
            router.replace("/auth/login");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white p-4">
            <StatusBar barStyle="dark-content" />
            <View className="flex-1 justify-center items-center">
                {/* Top area: logo and branding */}
                <View className="w-full justify-center items-center my-4">
                    {/* Use require(...) for bundling; replace path if needed */}
                    <Image
                        source={require("../assets/icon.png")}
                        accessibilityLabel="BalancedBite logo"
                        style={{
                            width: Math.min(120, width * 0.28),
                            height: Math.min(120, width * 0.28),
                            resizeMode: "contain",
                            marginBottom: 18,
                            borderRadius: 25
                        }}
                    />

                    <Text
                        style={{
                            fontSize: 28,
                            fontWeight: "800",
                            color: "#0f766e", // green-700
                            textAlign: "center",
                            marginBottom: 8,
                        }}
                        accessibilityRole="header"
                    >
                        BalancedBite
                    </Text>

                    <Text
                        style={{
                            fontSize: 15,
                            color: "#475569", // gray-600
                            textAlign: "center",
                            lineHeight: 22,
                            maxWidth: 560,
                            paddingHorizontal: 6,
                        }}
                    >
                        Smarter eating, simplified — track meals, get personalized meal plans,
                        and receive practical nutrition tips tailored to your goals.
                    </Text>
                </View>

                {/* Bottom area: CTA and legal */}
                <View className="w-full justify-center items-center my-4">
                    <Button
                        label={isLoading ? "Please wait..." : "Continue"}
                        onPress={handlePress}
                        disabled={isLoading}
                    // ensure the Button accepts className prop; if not, style inside Button component
                    // make it large & full width for comfortable tapping
                    // If your Button supports className:
                    // className="w-full h-12 rounded-xl"
                    />

                    <View className="my-8">
                        <Text
                            style={{
                                color: "#64748b",
                                fontSize: 12,
                                textAlign: "center",
                                lineHeight: 18,
                            }}
                        >
                            By continuing, you agree to our{" "}
                            <Text
                                style={{ color: "#2563eb", textDecorationLine: "underline" }}
                                onPress={() => Linking.openURL("https://balanced-bite-ten.vercel.app/privacy")}
                                accessibilityRole="link"
                            >
                                Privacy Policy
                            </Text>{" "}
                            and{" "}
                            <Text
                                style={{ color: "#2563eb", textDecorationLine: "underline" }}
                                onPress={() => Linking.openURL("https://balanced-bite-ten.vercel.app/terms")}
                                accessibilityRole="link"
                            >
                                Terms of Service
                            </Text>
                            .
                        </Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
