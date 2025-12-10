import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { userPreferences } from '../db/schema/user-preferences.schema';
// Zod schemas
export const userPreferencesInsertSchema = createInsertSchema(userPreferences);
export const userPreferencesInsertSchemaPartial = createInsertSchema(userPreferences).partial();
export const userPreferencesSelectSchema = createSelectSchema(userPreferences);
