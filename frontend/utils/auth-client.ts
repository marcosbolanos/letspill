import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const getBaseURL = () => {
  return process.env.EXPO_PUBLIC_API_URL;
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

