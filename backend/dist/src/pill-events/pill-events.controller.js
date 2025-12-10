import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { pillEventsService } from "./pill-events.service";
import { queryForUserId } from "../user-profiles/user.profiles.types";
import { requireAuthMiddleware } from "../authorization/middleware/require-auth.middleware";
import { authorizationService } from "../authorization/authorization.service";
const pillEventsController = new OpenAPIHono();
// This middleware ensures the former
pillEventsController.use('*', requireAuthMiddleware);
const getPillEventsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Pill Events'],
    request: {
        query: queryForUserId,
    },
    responses: {
        200: {
            description: 'List of pill events for the user',
            content: {
                'application/json': {
                    schema: z.array(z.any()),
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
pillEventsController.openapi(getPillEventsRoute, async (c) => {
    const requesterId = c.get("session")?.userId;
    const ownerId = c.req.valid("query").userId;
    const hasAccess = await (authorizationService.checkOwnershipOrAccessGrant(requesterId, ownerId));
    if (!hasAccess) {
        return c.json({ success: false, message: "Unauthorized" }, 403);
    }
    // At this point, we can be sure that the user has access 
    // We then process the request
    try {
        const preferences = await pillEventsService.getPillEvents(ownerId);
        return c.json(preferences, 200);
    }
    catch (e) {
        console.log(e);
        return c.json({ error: "Failed to read database" }, 500);
    }
});
export default pillEventsController;
