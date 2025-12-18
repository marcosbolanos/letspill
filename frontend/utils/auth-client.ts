import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { apiUrl } from '@/utils/envconfig'

export const authClient = createAuthClient({
  baseURL: apiUrl,
  plugins: [
    expoClient({
      scheme: "letspill",
      storagePrefix: "letspill",
      storage: SecureStore,
    })
  ]
});

