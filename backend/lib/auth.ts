import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { db } from "./db";
import ENV_CONFIG from "@/envconfig";

import * as schema from "../src/db/schema/auth.schema";
import { userPreferences } from "@/src/db/schema/user-preferences.schema";
import { userProfiles } from "src/db/schema/user-profiles.schema"

export const auth = betterAuth({
  plugins: [expo()],
  trustedOrigins: (request) => {
    const origin = request.headers.get("origin");

    // Always trust the app's custom scheme
    if (origin?.startsWith("letspill://")) return true;

    // In development, trust localhost on any port
    if (ENV_CONFIG.NODE_ENV === "development") {
      if (!origin) return true; // Mobile apps may not send origin
      if (origin.startsWith("http://localhost:")) return true;
      if (origin.startsWith("http://127.0.0.1:")) return true;
      if (origin.startsWith("exp://")) return true;
    }

    // For production mobile apps that don't send an origin header
    if (!origin) return true;

    return false;
  },
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
  },
  // Automatically create an entry in Profiles and Preferences for new users
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const profile = await db.insert(userProfiles).values({ userId: user.id, viewing: user.id }).returning()
          const prefs = await db.insert(userPreferences).values({ userId: user.id }).returning()
          console.log({ profile, prefs })
        }
      }
    }
  }
});

export type AuthType = {
  user: typeof auth.$Infer.Session.user | null
  session: typeof auth.$Infer.Session.session | null
}
