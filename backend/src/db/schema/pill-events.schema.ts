import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, boolean, index, date } from 'drizzle-orm/pg-core';

import { user } from "./auth.schema"



export const pillEvents = pgTable("pill_events", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  pillDate: date().notNull(),
  pillTaken: boolean().notNull()
},
  // Composite index on userId THEN pillDate, will speed up queries
  (table) => [
    index("pillEvents_userId_pillDate_idx").on(table.userId, table.pillDate)
  ]
)
