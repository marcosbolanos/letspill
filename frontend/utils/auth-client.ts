import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Use 10.0.2.2 for Android emulator, localhost for iOS simulator
const getBaseURL = () => {
  if (Platform.OS === "android") {
    return "http://10.122.155.125:3000";
  };
  return "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [
    expoClient({
      scheme: "letspill",
      storagePrefix: "letspill",
      storage: SecureStore,
    })
  ]
});

