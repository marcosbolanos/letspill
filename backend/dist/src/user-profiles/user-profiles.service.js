import { eq } from 'drizzle-orm';
import { db } from '../../lib/db';
import { userProfiles } from '../db/schema/user-profiles.schema';
export class UserProfilesService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getProfile(userId) {
        const query = await this.db.select()
            .from(userProfiles)
            .where(eq(userProfiles.userId, userId));
        return query[0] ?? null;
    }
    async getUserIdFromUsername(username) {
        const query = await this.db.select({
            field1: userProfiles.userId
        })
            .from(userProfiles)
            .where(eq(userProfiles.username, username));
        if (query.length === 0)
            return null;
        const userId = query[0].field1;
        return userId;
    }
    async getUsernameFromUserId(userId) {
        const query = await this.db.select({
            username: userProfiles.username
        })
            .from(userProfiles)
            .where(eq(userProfiles.userId, userId));
        if (query.length === 0)
            return null;
        return query[0].username;
    }
    async setProfile(userId, profile) {
        await this.db.update(userProfiles)
            .set(profile)
            .where(eq(userProfiles.userId, userId));
    }
}
export const userProfilesService = new UserProfilesService(db);
