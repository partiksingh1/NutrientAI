export default {
  expo: {
    name: "BalancedBite",
    slug: "balancedBite",
    icon: "./assets/icon.png",
    version: "2.0.0",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-asset",
      "expo-font"
    ],
    platforms: ["android"],
    experiments: {
      typedRoutes: true
    },
    scheme: "com.partiksingh.balancedbite",
    android: {
      package: "com.partiksingh.balancedbite"
    },
    extra: {
      router: {},
      eas: {
        projectId: "e5c53a4b-6699-4ce5-9219-a021b5f1d755"
      }
    },
    owner: "partiksingh"
  }
};
