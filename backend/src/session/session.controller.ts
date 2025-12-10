import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { auth } from "../../lib/auth";

const sessionController = new OpenAPIHono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null
  }
}>();

const getSessionRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Session'],
  responses: {
    200: {
      description: 'Get current session information',
      content: {
        'application/json': {
          schema: z.object({
            session: z.any().nullable(),
            user: z.any().nullable(),
          }),
        },
      },
    },
    401: {
      description: 'Unauthorized - no active session',
    },
  },
});

sessionController.openapi(getSessionRoute, (c) => {
  const session = c.get("session")
  const user = c.get("user")

  if (!user) return c.body(null, 401);

  return c.json({
    session,
    user
  });
});

export default sessionController;
