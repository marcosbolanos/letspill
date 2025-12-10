import { DBType, db } from '../../lib/db';
import { accessGrants } from '../db/schema/access-grants.schema';
import { eq, and } from 'drizzle-orm';

export class AuthorizationService {
  constructor(private db: DBType) { }

  checkOwnership(requesterId: string, ownerId: string) {
    return (requesterId === ownerId)
  };

  async checkAccessGrant(requesterId: string, ownerId: string) {
    const query = await this.db.select()
      .from(accessGrants)
      .where(and(
        eq(accessGrants.ownerId, ownerId),
        eq(accessGrants.granteeId, requesterId),
        eq(accessGrants.active, true)
      ))
    if (query.length == 0) {
      return false
    } else {
      return true
    }
  }

  async checkOwnershipOrAccessGrant(requesterId: string, ownerId: string) {
    if (this.checkOwnership(requesterId, ownerId)) {
      return true
    } else if (await this.checkAccessGrant(requesterId, ownerId)) {
      return true
    } else {
      return false
    }
  }
}
export const authorizationService = new AuthorizationService(db)
