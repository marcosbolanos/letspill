import { z } from '@hono/zod-openapi'
import { createSelectSchema } from 'drizzle-zod';

import { userProfiles } from '../db/schema/user-profiles.schema';

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters long")
  .max(32, "Username must be at most 32 characters long")
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/, "Invalid characters in username")
  .refine((val) => !/[_-]{2,}/.test(val), "Separators cannot repeat");

export const userProfilesSelectSchema = createSelectSchema(userProfiles);

export const queryForUserId = z.object(({
  userId: z.string()
}))
export const queryForUsername = z.object({
  username: usernameSchema
})
