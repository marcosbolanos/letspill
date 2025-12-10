import { z } from '@hono/zod-openapi';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { accessInvites, inviteStatusEnum } from "../db/schema/access-invites.schema";
import { accessGrants, accessGrantLog } from '../db/schema/access-grants.schema';
// Access invites //
// Zod schemas
export const inviteStatusEnumSchema = z.enum(inviteStatusEnum.enumValues);
export const accessInvitesInsertSchema = createInsertSchema(accessInvites);
export const accessInvitesSelectSchema = createSelectSchema(accessInvites);
// Access grants //
// Zod schemas
export const accessGrantsInsertSchema = createInsertSchema(accessGrants);
export const accessGrantsSelectSchema = createSelectSchema(accessGrants);
//Access grant log
export const accessGrantLogInsertSchema = createInsertSchema(accessGrantLog);
