import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { router } from "expo-router";
import AuthService from "../../services/authService";
import Button from "../../components/Button";
import { Toast } from "toastify-react-native";

export default function ResetPasswordScreen() {
    const [step, setStep] = useState<"email" | "otp">("email");
    const [email, setEmail] = useState("");
    const [otp, setOTP] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async () => {
        try {
            setLoading(true);
            await AuthService.forgotPassword(email);
            Toast.success("OTP sent to your email.");
            setStep("otp");
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        try {
            setLoading(true);
            if (newPassword.length < 8) {
                Toast.error("Password must be of atleast 8 characters!")
                return
            }
            await AuthService.resetPassword(email, otp, newPassword);
            Toast.success("Password reset successfully!");
            router.replace("/auth/login");
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <View className="flex-1 justify-center items-center px-6 py-10 bg-white">
                    <View className="w-full max-w-sm">
                        <Text className="text-2xl font-bold mb-6 text-center">Reset Password</Text>

                        {step === "email" ? (
                            <>
                                <TextInput
                                    placeholder="Enter your email"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    className="border border-gray-300 p-3 rounded-md mb-4"
                                />
                                <Button label={loading ? "Sending..." : "Send OTP"} onPress={handleSendOTP} disabled={loading} />
                                <TouchableOpacity className="w-full py-2 border border-black rounded-lg mt-4" onPress={() => { router.back() }} disabled={loading}>
                                    <Text className="text-center font-medium">Back</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TextInput
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChangeText={setOTP}
                                    keyboardType="numeric"
                                    className="border border-gray-300 p-3 rounded-md mb-4"
                                />
                                <TextInput
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry
                                    className="border border-gray-300 p-3 rounded-md mb-4"
                                />
                                <Button
                                    label={loading ? "Resetting..." : "Reset Password"}
                                    onPress={handleResetPassword}
                                    disabled={loading}
                                />
                                <TouchableOpacity className="w-full py-2 border border-black rounded-lg mt-4" onPress={() => { router.back() }} disabled={loading}>
                                    <Text className="text-center font-medium">Back</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
