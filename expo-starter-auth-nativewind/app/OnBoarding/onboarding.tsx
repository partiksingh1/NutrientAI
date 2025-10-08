import { router } from "expo-router";

import { OnboardingScreen } from "@/components/OnboardingScreen";

export default function OnboardingPage() {
  return (
    <OnboardingScreen
      onComplete={() => {
        router.replace("/(app)");
      }}
    />
  );
}
