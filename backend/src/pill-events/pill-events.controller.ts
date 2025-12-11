import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { generateId } from 'better-auth';

import { auth } from "../../lib/auth";

import { pillEventsService } from "./pill-events.service";

import { queryForPillEvents, pillEventsSelectSchema, PillEventsInsert, pillStatesSchema, PillStates, createPillEventsJsonSchema } from "./pill-events.types";

import { requireAuthMiddleware } from "../authorization/middleware/require-auth.middleware";
import { authorizationService } from "../authorization/authorization.service";

const pillEventsController = new OpenAPIHono<{
  // Here, auth is required on every route, so the context WILL contain session info
  Variables: {
    user: typeof auth.$Infer.Session.user
    session: typeof auth.$Infer.Session.session
  }
}>();
// This middleware ensures the former
pillEventsController.use('*', requireAuthMiddleware)

const getPillStatesRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Pill Events'],
  request: {
    query: queryForPillEvents
  },
  responses: {
    200: {
      description: 'List of pill events for the user, starting at a date',
      content: {
        'application/json': {
          schema: pillStatesSchema,
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

// A route to get the pill events of a user, needs authorization
pillEventsController.openapi(getPillStatesRoute, async (c) => {
  const requesterId = c.get("session")?.userId
  const ownerId = c.req.valid("query").ownerId
  const startDate = c.req.valid("query").startDate
  const hasAccess = await (authorizationService.checkOwnershipOrAccessGrant(requesterId, ownerId))
  if (!hasAccess) {
    return c.json({ success: false, message: "Unauthorized" }, 403)
  }

  // At this point, we can be sure that the user has access 
  // We then process the request
  try {
    const pillEvents = await pillEventsService.getLatestPillEvents(ownerId, startDate)
    const pillStates = pillEventsService.getPillStates(pillEvents)
    return c.json(pillStates, 200);
  } catch (e) {
    console.log(e);
    return c.json({ error: "Failed to read database" }, 500)
  }
})

const createPillEventRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Pill Events'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            pillEvent: createPillEventsJsonSchema
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: "Create pill event",
      content: {
        'aplication/json': {
          schema: z.object({
            message: z.string(),
          })
        }
      }
    },
    500: {
      description: 'Database Error',
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

pillEventsController.openapi(createPillEventRoute, async (c) => {
  const userId = c.get("session").userId;
  const event = c.req.valid('json').pillEvent;

  const pillInsert: PillEventsInsert = {
    id: generateId(),
    userId: userId,
    pillDate: event.pillDate,
    pillTaken: event.pillTaken
  }
  try {
    await pillEventsService.createPillEvent(pillInsert)
    return c.json({ message: 'Event created' }, 200)
  } catch (e) {
    return c.json({ error: 'Database error' }, 500)
  }
})

export default pillEventsController


