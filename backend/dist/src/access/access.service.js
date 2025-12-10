import { eq, and, not } from 'drizzle-orm';
import { generateId } from 'better-auth';
import { db } from '../../lib/db';
import { accessGrants, accessGrantLog } from '../db/schema/access-grants.schema';
import { accessInvites } from '../db/schema/access-invites.schema';
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
        const rows = await this.db.select()
            .from(accessInvites)
            .where(and(eq(accessInvites.inviteeId, inviteeId), eq(accessInvites.status, "pending")));
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
        const query = await this.db.select()
            .from(accessGrants)
            .where(and(eq(accessGrants.ownerId, ownerId), eq(accessGrants.active, true)))
            .orderBy(accessGrants.updatedAt);
        return query;
    }
}
export const accessService = new AccessService(db);
