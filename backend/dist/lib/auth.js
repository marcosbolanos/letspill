import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { db } from "./db";
import 'dotenv/config';
import * as schema from "../src/db/schema/auth.schema";
import { userPreferences } from "@/src/db/schema/user-preferences.schema";
import { userProfiles } from "src/db/schema/user-profiles.schema";
export const auth = betterAuth({
    plugins: [expo()],
    trustedOrigins: [
        "letspill://*",
        "http://localhost:8081",
        ...(process.env.NODE_ENV === "development" ? [
            "exp://*/*", // Trust all Expo development URLs
            "exp://10.0.0.*:*/*", // Trust 10.0.0.x IP range
            "exp://192.168.*.*:*/*", // Trust 192.168.x.x IP range
            "exp://172.*.*.*:*/*", // Trust 172.x.x.x IP range
            "exp://localhost:*/*" // Trust localhost
        ] : [])
    ],
    database: drizzleAdapter(db, {
        provider: "pg",
        schema
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }
    },
    // Automatically create an entry in Profiles and Preferences for new users
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    const profile = await db.insert(userProfiles).values({ userId: user.id, viewing: user.id }).returning();
                    const prefs = await db.insert(userPreferences).values({ userId: user.id }).returning();
                    console.log({ profile, prefs });
                }
            }
        }
    }
});
