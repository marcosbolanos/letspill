import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { userProfilesService } from "./user-profiles.service";
import { userProfilesSelectSchema, queryForSetUserProfile } from "./user.profiles.types";
import { requireAuthMiddleware } from "../authorization/middleware/require-auth.middleware";
const userProfilesController = new OpenAPIHono();
// This middleware ensures the former
userProfilesController.use('*', requireAuthMiddleware);
const getUserProfileRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['User Profile'],
    responses: {
        200: {
            description: 'User profile of the authenticated user',
            content: {
                'application/json': {
                    schema: userProfilesSelectSchema,
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
// A route to get the profile of the authenticated user
userProfilesController.openapi(getUserProfileRoute, async (c) => {
    const userId = c.get("session")?.userId;
    // At this point, we can be sure that the user has access 
    // We then process the request
    try {
        const preferences = await userProfilesService.getProfile(userId);
        if (!preferences) {
            return c.json({ error: "User profile not found" }, 500);
        }
        return c.json(preferences, 200);
    }
    catch (e) {
        console.log(e);
        return c.json({ error: "Failed to read database" }, 500);
    }
});
const setUserProfileRoute = createRoute({
    method: 'put',
    path: '/',
    tags: ['User Profile'],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: queryForSetUserProfile
                }
            }
        }
    },
    responses: {
        200: {
            description: "Set user profile",
            content: {
                'application/json': {
                    schema: z.object({
                        message: z.string()
                    })
                }
            }
        },
        500: {
            description: 'Database error',
            content: {
                'application/json': {
                    schema: z.object({
                        error: z.string(),
                    })
                }
            }
        }
    }
});
userProfilesController.openapi(setUserProfileRoute, async (c) => {
    const userId = c.get("session").userId;
    const newProfile = c.req.valid("json").newProfile;
    try {
        await userProfilesService.setProfile(userId, newProfile);
        return c.json({ message: "User profile has been updated" }, 200);
    }
    catch (e) {
        return c.json({ error: "Couldn't read database" }, 500);
    }
});
export default userProfilesController;
