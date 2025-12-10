import { db } from '../../lib/db';
import { accessGrants } from '../db/schema/access-grants.schema';
import { eq, and } from 'drizzle-orm';
export class AuthorizationService {
    db;
    constructor(db) {
        this.db = db;
    }
    checkOwnership(requesterId, ownerId) {
        return (requesterId === ownerId);
    }
    ;
    async checkAccessGrant(requesterId, ownerId) {
        const query = await this.db.select()
            .from(accessGrants)
            .where(and(eq(accessGrants.ownerId, ownerId), eq(accessGrants.granteeId, requesterId), eq(accessGrants.active, true)));
        if (query.length == 0) {
            return false;
        }
        else {
            return true;
        }
    }
    async checkOwnershipOrAccessGrant(requesterId, ownerId) {
        if (this.checkOwnership(requesterId, ownerId)) {
            return true;
        }
        else if (await this.checkAccessGrant(requesterId, ownerId)) {
            return true;
        }
        else {
            return false;
        }
    }
}
export const authorizationService = new AuthorizationService(db);
