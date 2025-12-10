import { z } from '@hono/zod-openapi';
export const usernameSchema = z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(32, "Username must be at most 32 characters long")
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/, "Invalid characters in username")
    .refine((val) => !/[_-]{2,}/.test(val), "Separators cannot repeat");
export const queryForUserId = z.object(({
    userId: z.string()
}));
export const queryForUsername = z.object({
    username: usernameSchema
});
