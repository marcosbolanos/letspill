import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { db } from "./db";
import 'dotenv/config';

import * as schema from "../src/db/schema/auth.schema";

export const auth = betterAuth({
  plugins: [expo()],
  trustedOrigins: [
    "letspill://*",
    "http://localhost:8081",
    ...(process.env.NODE_ENV === "development" ? [
      "exp://*/*",                 // Trust all Expo development URLs
      "exp://10.0.0.*:*/*",        // Trust 10.0.0.x IP range
      "exp://192.168.*.*:*/*",     // Trust 192.168.x.x IP range
      "exp://172.*.*.*:*/*",       // Trust 172.x.x.x IP range
      "exp://localhost:*/*"        // Trust localhost
    ] : [])],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }
  }
});

export type AuthType = {
  user: typeof auth.$Infer.Session.user | null
  session: typeof auth.$Infer.Session.session | null
}
