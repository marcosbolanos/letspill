import { createMiddleware } from 'hono/factory';

// This middleware checks if the session object exists in the context
// The session object is created by the auth middleware if a user is properly authenticated
export const requireAuthMiddleware = createMiddleware(async (c, next) => {
  const session = c.get("session")
  if (!session) {
    return c.json({ error: "Authorization required" }, 401);
  }
  await next();
  return;
})
