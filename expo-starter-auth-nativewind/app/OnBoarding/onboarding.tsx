import { OnboardingScreen } from "@/components/OnboardingScreen";
import { router } from "expo-router";

export default function OnboardingPage() {
    return <OnboardingScreen onComplete={() => { router.replace("/(app)") }} />;
}
