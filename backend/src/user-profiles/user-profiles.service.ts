import { eq } from 'drizzle-orm'

import { db, DBType } from '../../lib/db';
import { userProfiles } from '../db/schema/user-profiles.schema';

export type UserProfileUpdate = Partial<typeof userProfiles.$inferInsert>;

export class UserProfilesService {
  constructor(private db: DBType) { }

  async getProfile(userId: string) {
    const query = await this.db.select()
      .from(userProfiles)
      .where(eq(
        userProfiles.userId, userId
      ));
    return query[0] ?? null;
  }
  async getUserIdFromUsername(username: string) {
    const query = await this.db.select({
      field1: userProfiles.userId
    })
      .from(userProfiles)
      .where(eq(
        userProfiles.username, username
      ))
    if (query.length === 0) return null;
    const userId = query[0].field1
    return userId
  }
  async getUsernameFromUserId(userId: string) {
    const query = await this.db.select({
      username: userProfiles.username
    })
      .from(userProfiles)
      .where(eq(
        userProfiles.userId, userId
      ))
    if (query.length === 0) return null;
    return query[0].username
  }
  async setProfile(userId: string, profile: UserProfileUpdate) {
    await this.db.update(userProfiles)
      .set(profile)
      .where(eq(userProfiles.userId, userId))
  }
}

export const userProfilesService = new UserProfilesService(db)
