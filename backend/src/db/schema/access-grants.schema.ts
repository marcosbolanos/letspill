import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, jsonb, index, unique, pgEnum, check } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';


export const accessGrants = pgTable(
  "access_grants",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    granteeId: text("grantee_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
    active: boolean("active").default(true).notNull(),
  },
  (table) => [
    // Lookup patterns:
    // check who has access to a given owner
    index("access_owner_grantee_idx").on(table.ownerId, table.granteeId),
    // check what grants a grantee has
    index("access_grantee_idx").on(table.granteeId),
    // unique: only one active grant per owner, grantee and scope
    unique("access_owner_grantee_scope_uniq").on(
      table.ownerId,
      table.granteeId,
    ),
    check("no_self_grants", sql`${table.ownerId} != ${table.granteeId}`)
  ]
);

export const accessGrantLog = pgTable(
  "access_grant_log",
  {
    id: text("id").primaryKey(),
    actorId: text("actor_id").references(() => user.id),
    targetOwnerId: text("target_owner_id").references(() => user.id),
    granteeId: text("grantee_id").references(() => user.id),
    action: text("action").notNull(),
    objectType: text("object_type"),
    objectId: text("object_id"),
    details: jsonb("details"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("audit_actor_idx").on(table.actorId),
    index("audit_target_idx").on(table.targetOwnerId),
  ]
);
