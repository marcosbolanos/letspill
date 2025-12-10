import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  username: text("username").notNull().unique(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
})

export const userProfileRelations = relations(userProfiles, ({ one }) => ({
  user: one(user, {
    fields: [userProfiles.userId],
    references: [user.id],
  }),
}));
