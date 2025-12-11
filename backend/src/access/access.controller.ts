import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import { auth } from '../../lib/auth';

import { accessService } from './access.service';
import { queryForUsername, queryForUserId } from '../user-profiles/user.profiles.types';
import { outgoingAccessGrantSchema, incomingInvitesResponseSchema } from './access.types';

import { userProfilesService } from '../user-profiles/user-profiles.service';
import { usernameSchema } from '../user-profiles/user.profiles.types';

import { requireAuthMiddleware } from '../authorization/middleware/require-auth.middleware';

const accessController = new OpenAPIHono<{
  // Here, auth is required on every route, so the context WILL contain session info
  Variables: {
    user: typeof auth.$Infer.Session.user
    session: typeof auth.$Infer.Session.session
  }
}>();
accessController.use("*", requireAuthMiddleware)

const getOutgoingGrantsRoute = createRoute({
  method: 'get',
  path: '/outgoing-grants',
  tags: ['Access'],
  responses: {
    200: {
      description: 'List of active outgoing access grants with grantee usernames',
      content: {
        'application/json': {
          schema: z.array(outgoingAccessGrantSchema),
        },
      },
    },
    500: {
      description: 'Database error',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

// View existing grants for user
accessController.openapi(getOutgoingGrantsRoute, async (c) => {
  const ownerId = c.get("session").userId
  try {
    const grants = await accessService.getActiveAccessGrants(ownerId)
    return c.json(grants, 200)
  } catch (e) {
    console.log(e)
    return c.json({ success: false, message: "Couldn't read database" }, 500)
  }
})

const getIncomingInvitesRoute = createRoute({
  method: 'get',
  path: '/incoming-invites',
  tags: ['Access'],
  responses: {
    200: {
      description: 'Pending and approved incoming access invites with owner usernames',
      content: {
        'application/json': {
          schema: incomingInvitesResponseSchema,
        },
      },
    },
    500: {
      description: 'Database error',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

// View incoming invites for a user
accessController.openapi(getIncomingInvitesRoute, async (c) => {
  const inviteeId = c.get("session").userId;
  try {
    const [pending, approved] = await Promise.all([
      accessService.getPendingAccessInvites(inviteeId),
      accessService.getApprovedAccessInvites(inviteeId)
    ])
    return c.json({ pending, approved }, 200)
  } catch (e) {
    console.log(e)
    return c.json({ success: false, message: "Couldn't read database" }, 500)
  }
})

const postInviteRoute = createRoute({
  method: 'post',
  path: '/invite',
  tags: ['Access'],
  request: {
    query: queryForUsername,
  },
  responses: {
    200: {
      description: 'Invite sent successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
    400: {
      description: 'Bad request (e.g., self-invite)',
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
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

// Send an invite to a user
accessController.openapi(postInviteRoute,
  async (c) => {
    const ownerId = c.get("session").userId
    const username = c.req.valid('query').username

    try {
      // Check if the user exists
      const inviteeId = await userProfilesService.getUserIdFromUsername(username)
      if (inviteeId === null) {
        // Silently fail (for user privacy)
        return c.json({ success: true, message: "Request processed" }, 200)
      }
      // Never create invites that are destined to the sender
      if (inviteeId === ownerId) {
        return c.json({ success: false, message: "No self-invites!" }, 400)
      }

      // This helper uses onConflictDoUpdate so no need to worry about duplicates
      await accessService.upsertAccessInvitePending(ownerId, inviteeId)

      return c.json({ success: true, message: 'Request processed' }, 200)
    } catch (e) {
      console.log(e)
      return c.json({ success: false, message: "Couldn't read database" }, 500)
    }
  })

const approveInviteRoute = createRoute({
  method: 'put',
  path: '/approve-invite',
  tags: ['Access'],
  request: {
    query: queryForUserId,
  },
  responses: {
    200: {
      description: 'Invite approved successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
    404: {
      description: 'No pending invite found',
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
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

// Approve an invite
accessController.openapi(approveInviteRoute, async (c) => {
  const inviteeId = c.get("session").userId;
  const ownerId = c.req.valid("query").userId;

  try {
    // Check if any rows were updated, only create grant if a pending invite actually existed
    const rowsUpdated = await accessService.setAccessInviteApproved(ownerId, inviteeId)
    if (rowsUpdated === 0) {
      return c.json({ success: false, message: 'No pending invite found' }, 404)
    }
    await accessService.upsertAccessGrantActive(ownerId, inviteeId)
    return c.json({ success: true, message: 'Request processed' }, 200)
  } catch (e) {
    console.log(e)
    return c.json({ success: false, message: "Couldn't read database" }, 500)
  }
})

const ignoreInviteRoute = createRoute({
  method: 'put',
  path: '/ignore-invite',
  tags: ['Access'],
  request: {
    query: queryForUserId,
  },
  responses: {
    200: {
      description: 'Invite ignored successfully',
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
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

// Ignore an invite
accessController.openapi(ignoreInviteRoute, async (c) => {
  const inviteeId = c.get("session").userId;
  const ownerId = c.req.valid("query").userId;

  try {
    // UPDATE won't do anything if the invite doesn't exist, or if it's already accepted
    // We also ensure that the request is pending
    await accessService.setAccessInviteIgnored(ownerId, inviteeId)
    return c.json({ success: true, message: 'Request processed' }, 200)
  } catch (e) {
    console.log(e)
    return c.json({ success: false, message: "Couldn't read database" }, 500)
  }
})

const revokeGrantRoute = createRoute({
  method: 'put',
  path: '/revoke-grant',
  tags: ['Access'],
  request: {
    query: queryForUserId,
  },
  responses: {
    200: {
      description: 'Access revoked successfully',
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
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

// Revoke access to a specific user
accessController.openapi(revokeGrantRoute, async (c) => {
  const ownerId = c.get("session").userId
  const granteeId = c.req.valid('query').userId

  try {
    await accessService.setAccessInviteRevoked(ownerId, granteeId)
    await accessService.setAccessGrantRevoked(ownerId, granteeId)
    return c.json({ success: true, message: 'Request processed' }, 200)
  } catch (e) {
    console.log(e)
    return c.json({ success: false, message: "Couldn't read database" }, 500)
  }
})


export default accessController
