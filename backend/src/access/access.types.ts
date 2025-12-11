import { z } from '@hono/zod-openapi';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';

import { accessInvites, inviteStatusEnum } from "../db/schema/access-invites.schema";
import { accessGrants, accessGrantLog } from '../db/schema/access-grants.schema';
import { usernameSchema } from '../user-profiles/user.profiles.types';

// Access invites //

// Zod schemas
export const inviteStatusEnumSchema = z.enum(inviteStatusEnum.enumValues);
export const accessInvitesInsertSchema = createInsertSchema(accessInvites);
export const accessInvitesSelectSchema = createSelectSchema(accessInvites);

// Schema for incoming invites with owner username
export const incomingAccessInviteSchema = accessInvitesSelectSchema.extend({
  ownerUsername: usernameSchema.nullable()
});

// Schema for the incoming invites response
export const incomingInvitesResponseSchema = z.object({
  pending: z.array(incomingAccessInviteSchema),
  approved: z.array(incomingAccessInviteSchema)
});

// Typescript types
export type InviteStatus = z.infer<typeof inviteStatusEnumSchema>;
export type AccessInvitesInsert = z.infer<typeof accessInvitesInsertSchema>;
export type AccessInvitesSelect = z.infer<typeof accessInvitesSelectSchema>;
export type IncomingAccessInvite = z.infer<typeof incomingAccessInviteSchema>;
export type IncomingInvitesResponse = z.infer<typeof incomingInvitesResponseSchema>;


// Access grants //

// Zod schemas
export const accessGrantsInsertSchema = createInsertSchema(accessGrants);
export const accessGrantsSelectSchema = createSelectSchema(accessGrants);

// Schema for outgoing grants with grantee username
export const outgoingAccessGrantSchema = accessGrantsSelectSchema.extend({
  granteeUsername: usernameSchema.nullable()
});

// Typescript types
export type AccessGrantsInsert = z.infer<typeof accessGrantsInsertSchema>;
export type AccessGrantsSelect = z.infer<typeof accessGrantsSelectSchema>;
export type OutgoingAccessGrant = z.infer<typeof outgoingAccessGrantSchema>;


//Access grant log
export const accessGrantLogInsertSchema = createInsertSchema(accessGrantLog);

// Typescript types
export type AccessGrantLogInsert = typeof accessGrantLog.$inferInsert;
