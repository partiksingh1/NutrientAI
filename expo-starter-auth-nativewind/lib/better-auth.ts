import { createAuthClient } from "better-auth/react-native";

const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000",
  session: {
    storage: {
      get: async (key: string) => {
        try {
          const { AsyncStorage } = await import("@react-native-async-storage/async-storage");
          return await AsyncStorage.getItem(key);
        } catch {
          return null;
        }
      },
      set: async (key: string, value: string) => {
        try {
          const { AsyncStorage } = await import("@react-native-async-storage/async-storage");
          await AsyncStorage.setItem(key, value);
        } catch {
          // Handle error
        }
      },
      remove: async (key: string) => {
        try {
          const { AsyncStorage } = await import("@react-native-async-storage/async-storage");
          await AsyncStorage.removeItem(key);
        } catch {
          // Handle error
        }
      },
    },
  },
});

export { authClient };