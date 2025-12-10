import { eq } from 'drizzle-orm';
import { db } from '../../lib/db';
import { userPreferences } from '../db/schema/user-preferences.schema';
class UserPreferencesService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getPreferences(ownerId) {
        const query = await this.db.select()
            .from(userPreferences)
            .where(eq(userPreferences.userId, ownerId));
        return query[0] ?? null;
    }
    async setPreferences(userId, preferences) {
        const query = await this.db.update(userPreferences)
            .set(preferences)
            .where(eq(userPreferences.userId, userId));
    }
}
export const userPreferencesService = new UserPreferencesService(db);
