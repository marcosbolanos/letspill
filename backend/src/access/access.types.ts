import { z } from '@hono/zod-openapi';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';

import { accessInvites, inviteStatusEnum } from "../db/schema/access-invites.schema";
import { accessGrants, accessGrantLog } from '../db/schema/access-grants.schema';

// Access invites //

// Zod schemas
export const inviteStatusEnumSchema = z.enum(inviteStatusEnum.enumValues);
export const accessInvitesInsertSchema = createInsertSchema(accessInvites);
export const accessInvitesSelectSchema = createSelectSchema(accessInvites);

// Typescript types
export type InviteStatus = z.infer<typeof inviteStatusEnumSchema>;
export type AccessInvitesInsert = z.infer<typeof accessInvitesInsertSchema>;
export type AccessInvitesSelect = z.infer<typeof accessInvitesSelectSchema>;


// Access grants //

// Zod schemas
export const accessGrantsInsertSchema = createInsertSchema(accessGrants);
export const accessGrantsSelectSchema = createSelectSchema(accessGrants);

// Typescript types
export type AccessGrantsInsert = z.infer<typeof accessGrantsInsertSchema>;
export type AccessGrantsSelect = z.infer<typeof accessGrantsSelectSchema>;


//Access grant log
export const accessGrantLogInsertSchema = createInsertSchema(accessGrantLog);

// Typescript types
export type AccessGrantLogInsert = typeof accessGrantLog.$inferInsert;
