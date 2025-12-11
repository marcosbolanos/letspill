import { eq } from 'drizzle-orm';

import { db, DBType } from '../../lib/db';
import { userPreferences } from '../db/schema/user-preferences.schema';

import { UserPreferencesInsertPartial } from './user-preferences.types';

class UserPreferencesService {
  constructor(private db: DBType) { }

  async getPreferences(ownerId: string) {
    const query = await this.db.select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, ownerId))
    return query[0] ?? null
  }

  async setPreferences(userId: string, preferences: UserPreferencesInsertPartial) {
    await this.db.update(userPreferences)
      .set(preferences)
      .where(eq(userPreferences.userId, userId))
  }
}
export const userPreferencesService = new UserPreferencesService(db)
