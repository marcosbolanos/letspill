import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { auth } from "../../lib/auth";

import { userPreferencesService } from "./user-preferences.service";
import { queryForUserId } from "../user-profiles/user.profiles.types";

import { requireAuthMiddleware } from "../authorization/middleware/require-auth.middleware";
import { authorizationService } from "../authorization/authorization.service";

const userPreferencesController = new OpenAPIHono<{
  // Here, auth is required on every route, so the context WILL contain session info
  Variables: {
    user: typeof auth.$Infer.Session.user
    session: typeof auth.$Infer.Session.session
  }
}>();
// This middleware ensures the former
userPreferencesController.use('*', requireAuthMiddleware)

const getUserPreferencesRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['User Preferences'],
  request: {
    query: queryForUserId,
  },
  responses: {
    200: {
      description: 'User preferences',
      content: {
        'application/json': {
          schema: z.any(),
        },
      },
    },
    403: {
      description: 'Unauthorized - no access to this user data',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
    500: {
      description: 'Database error',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
});

// A route to get the preferences of a user, needs authorization
userPreferencesController.openapi(getUserPreferencesRoute, async (c) => {
  const requesterId = c.get("session")?.userId
  const ownerId = c.req.valid("query").userId
  const hasAccess = await (authorizationService.checkOwnershipOrAccessGrant(requesterId, ownerId))
  if (!hasAccess) {
    return c.json({ success: false, message: "Unauthorized" }, 403)
  }

  // At this point, we can be sure that the user has access 
  // We then process the request
  try {
    const preferences = await userPreferencesService.getPreferences(ownerId);
    if (!preferences) {
      return c.json({ error: "User preferences not found" }, 500)
    }
    return c.json(preferences, 200);
  } catch (e) {
    console.log(e);
    return c.json({ error: "Failed to read database" }, 500)
  }
})

export default userPreferencesController
