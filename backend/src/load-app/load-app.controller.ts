import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { auth, AuthType } from '../../lib/auth';

import { requireAuthMiddleware } from "../authorization/middleware/require-auth.middleware";

import { userProfilesService } from '../user-profiles/user-profiles.service'
import { userPreferencesService } from '../user-preferences/user-preferences.service';
import { pillEventsService } from '../pill-events/pill-events.service';
import { authorizationService } from '../authorization/authorization.service'

import { loadDataSchema } from './load-app.types';

const loadAppController = new OpenAPIHono<{
  // Here, auth is required on every route, so the context WILL contain session info
  Variables: {
    user: typeof auth.$Infer.Session.user
    session: typeof auth.$Infer.Session.session
  }
}>();
// This middleware ensures the former
loadAppController.use('*', requireAuthMiddleware)

const getLoadAppRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Load App'],
  responses: {
    200: {
      description: 'Get the user profile, as well as visible profile and pill data',
      content: {
        'application/json': {
          schema: loadDataSchema
        }
      }
    },
    403: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      }
    },
    500: {
      description: 'Database error',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      }
    }
  }
})

loadAppController.openapi(getLoadAppRoute, async (c) => {
  const userId = c.get("session").userId;
  try {
    const profile = await userProfilesService.getProfile(userId);
    const viewedUser = profile.viewing;

    const hasAccess = authorizationService.checkOwnershipOrAccessGrant(userId, viewedUser)
    if (!hasAccess) {
      return c.json({ error: "Unauthorized" }, 403)
    }

    const preferences = await userPreferencesService.getPreferences(viewedUser);
    if (!preferences) {
      return c.json({ error: "User preferences not found" }, 500)
    };

    const startDate = preferences.startDate;
    const pillEvents = await pillEventsService.getPillEvents(viewedUser, startDate)
    const pillStates = pillEventsService.getPillStates(pillEvents)
    return c.json({
      profile: profile,
      viewedPreferences: preferences,
      viewedPillStates: pillStates
    }, 200)

  } catch (e) {
    console.log(e);
    return c.json({ error: "Database error" }, 500)
  }
})

export default loadAppController
