import { z } from '@hono/zod-openapi';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';

import { userPreferences } from '../db/schema/user-preferences.schema';

// Zod schemas
export const userPreferencesInsertSchema = createInsertSchema(userPreferences)
export const userPreferencesInsertSchemaPartial = createInsertSchema(userPreferences).partial()
export const userPreferencesSelectSchema = createSelectSchema(userPreferences)

export const queryForSetUserPreferences = z.object({
  newPreferences: userPreferencesInsertSchemaPartial
})

// Typescript types
export type UserPreferencesInsert = z.infer<typeof userPreferencesInsertSchema>
export type UserPreferencesInsertPartial = z.infer<typeof userPreferencesInsertSchemaPartial>
export type UserPreferencesSelect = z.infer<typeof userPreferencesSelectSchema>

