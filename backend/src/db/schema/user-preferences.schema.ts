import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, date, pgEnum } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';


export const pillRegimeEnum = pgEnum("pill_regime_enum", ["none", "21on7off", "21on7placebo", "21continous", "28continous"])

export const userPreferences = pgTable("user_preferences", {
  userId: text("user_id").primaryKey().references(() => user.id),
  pillRegime: pillRegimeEnum("pill_regime").notNull().default("21on7off"),
  startDate: date().notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
});

export const userPreferenceRelations = relations(userPreferences, ({ one }) => ({
  user: one(user, {
    fields: [userPreferences.userId],
    references: [user.id],
  }),
}));


