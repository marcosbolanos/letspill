import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, index, unique, pgEnum, check } from 'drizzle-orm/pg-core';

import { user } from './auth.schema';

export const inviteStatusEnum = pgEnum("invite_status", ["pending", "approved", "revoked", "ignored"]);

export const accessInvites = pgTable(
  "access_invites", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id),
  inviteeId: text("invitee_id")
    .notNull()
    .references(() => user.id),
  status: inviteStatusEnum("status")
    .notNull()
    .default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
},
  (table) => [
    index("access_request_owner_invitee_idx").on(table.ownerId, table.inviteeId),
    index("access_request_invitee_idx").on(table.inviteeId),
    unique("access_request_owner_invitee_uniq").on(
      table.ownerId,
      table.inviteeId
    ),
    check("no_self_invites", sql`${table.ownerId} != ${table.inviteeId}`)
  ]
);

