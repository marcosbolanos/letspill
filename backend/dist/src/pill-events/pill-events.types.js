import { z } from '@hono/zod-openapi';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { pillEvents } from '../db/schema/pill-events.schema';
// Pill events //
// Zod schemas
export const getBlisterQuerySchema = z.object({
    userId: z.string()
});
export const pillStatesSchema = z.record(z.string(), z.boolean());
export const pillEventsInsertSchema = createInsertSchema(pillEvents);
export const pillEventsSelectSchema = createSelectSchema(pillEvents);
export const queryForPillEvents = z.object({
    ownerId: z.string(),
    startDate: z.string()
});
export const createPillEventsJsonSchema = z.object({
    pillDate: z.string(),
    pillTaken: z.boolean()
});
