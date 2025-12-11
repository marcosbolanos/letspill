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
// Access grants //
// Zod schemas
export const accessGrantsInsertSchema = createInsertSchema(accessGrants);
export const accessGrantsSelectSchema = createSelectSchema(accessGrants);
// Schema for outgoing grants with grantee username
export const outgoingAccessGrantSchema = accessGrantsSelectSchema.extend({
    granteeUsername: usernameSchema.nullable()
});
//Access grant log
export const accessGrantLogInsertSchema = createInsertSchema(accessGrantLog);
