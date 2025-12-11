import { eq, and, not } from 'drizzle-orm';
import { generateId } from 'better-auth';
import { db } from '../../lib/db';
import { accessGrants, accessGrantLog } from '../db/schema/access-grants.schema';
import { accessInvites } from '../db/schema/access-invites.schema';
import { userProfiles } from '../db/schema/user-profiles.schema';
export class AccessService {
    db;
    constructor(db) {
        this.db = db;
    }
    async upsertAccessInvitePending(ownerId, inviteeId) {
        await this.db.insert(accessInvites)
            .values({
            id: generateId(),
            ownerId: ownerId,
            inviteeId: inviteeId,
        })
            .onConflictDoUpdate({
            target: [accessInvites.ownerId, accessInvites.inviteeId],
            where: not(eq(accessInvites.status, "approved")),
            set: { status: "pending" }
        });
    }
    async setAccessInviteApproved(ownerId, inviteeId) {
        const result = await this.db.update(accessInvites)
            .set({
            status: "approved",
            updatedAt: new Date()
        })
            .where(and(eq(accessInvites.ownerId, ownerId), eq(accessInvites.inviteeId, inviteeId), eq(accessInvites.status, "pending")));
        return result.rowCount ?? 0;
    }
    async setAccessInviteIgnored(ownerId, inviteeId) {
        await this.db.update(accessInvites)
            .set({
            status: "ignored",
            updatedAt: new Date()
        })
            .where(and(eq(accessInvites.ownerId, ownerId), eq(accessInvites.inviteeId, inviteeId), eq(accessInvites.status, "pending")));
    }
    async setAccessInviteRevoked(ownerId, inviteeId) {
        await this.db.update(accessInvites)
            .set({
            status: "revoked",
            updatedAt: new Date()
        })
            .where(and(eq(accessInvites.ownerId, ownerId), eq(accessInvites.inviteeId, inviteeId), eq(accessInvites.status, "pending")));
    }
    async getPendingAccessInvites(inviteeId) {
        const rows = await this.db.select({
            id: accessInvites.id,
            ownerId: accessInvites.ownerId,
            inviteeId: accessInvites.inviteeId,
            status: accessInvites.status,
            createdAt: accessInvites.createdAt,
            updatedAt: accessInvites.updatedAt,
            ownerUsername: userProfiles.username,
        })
            .from(accessInvites)
            .leftJoin(userProfiles, eq(accessInvites.ownerId, userProfiles.userId))
            .where(and(eq(accessInvites.inviteeId, inviteeId), eq(accessInvites.status, "pending")));
        return rows;
    }
    async getApprovedAccessInvites(inviteeId) {
        const rows = await this.db.select({
            id: accessInvites.id,
            ownerId: accessInvites.ownerId,
            inviteeId: accessInvites.inviteeId,
            status: accessInvites.status,
            createdAt: accessInvites.createdAt,
            updatedAt: accessInvites.updatedAt,
            ownerUsername: userProfiles.username,
        })
            .from(accessInvites)
            .leftJoin(userProfiles, eq(accessInvites.ownerId, userProfiles.userId))
            .where(and(eq(accessInvites.inviteeId, inviteeId), eq(accessInvites.status, "approved")));
        return rows;
    }
    async upsertAccessGrantActive(ownerId, granteeId) {
        await this.db.insert(accessGrants).values({
            id: generateId(),
            ownerId: ownerId,
            granteeId: granteeId,
        }).onConflictDoUpdate({
            target: [accessGrants.ownerId, accessGrants.granteeId],
            set: {
                active: true
            }
        });
        await this.db.insert(accessGrantLog).values({
            id: generateId(),
            action: "grant access",
            targetOwnerId: ownerId,
            actorId: ownerId,
            granteeId: granteeId,
        });
    }
    async setAccessGrantRevoked(ownerId, granteeId) {
        await this.db.update(accessGrants)
            .set({
            active: false,
            updatedAt: new Date()
        })
            .where(and(eq(accessGrants.ownerId, ownerId), eq(accessGrants.granteeId, granteeId)));
        const log = {
            id: generateId(),
            action: "revoke access",
            targetOwnerId: ownerId,
            actorId: ownerId,
            granteeId: granteeId,
        };
        await this.db.insert(accessGrantLog).values(log);
    }
    async getActiveAccessGrants(ownerId) {
        const query = await this.db.select({
            id: accessGrants.id,
            ownerId: accessGrants.ownerId,
            granteeId: accessGrants.granteeId,
            createdAt: accessGrants.createdAt,
            updatedAt: accessGrants.updatedAt,
            active: accessGrants.active,
            granteeUsername: userProfiles.username,
        })
            .from(accessGrants)
            .leftJoin(userProfiles, eq(accessGrants.granteeId, userProfiles.userId))
            .where(and(eq(accessGrants.ownerId, ownerId), eq(accessGrants.active, true)))
            .orderBy(accessGrants.updatedAt);
        return query;
    }
}
export const accessService = new AccessService(db);
