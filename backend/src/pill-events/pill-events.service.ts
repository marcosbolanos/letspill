import { eq, and, gte, sql } from 'drizzle-orm';

import { db, DBType } from '../../lib/db';
import { pillEvents } from '../db/schema/pill-events.schema';
import { PillEventsInsert, PillEventsSelect, PillStates } from './pill-events.types';

class PillEventsService {
  constructor(private db: DBType) { }

  async getPillEvents(ownerId: string, startDate: string) {
    const query = await this.db.select()
      .from(pillEvents)
      .where(and(
        eq(pillEvents.userId, ownerId),
        gte(pillEvents.pillDate, startDate),
      ))
    return query
  }

  async createPillEvent(pillEvent: PillEventsInsert) {
    await this.db.insert(pillEvents)
      .values(pillEvent)
  }

  async getLatestPillEvents(ownerId: string, startDate: string) {
    const subquery = this.db.select({
      id: pillEvents.id,
      userId: pillEvents.userId,
      pillDate: pillEvents.pillDate,
      createdAt: pillEvents.createdAt,
      pillTaken: pillEvents.pillTaken,
      rn: sql<number>`row_number() over (
        partition by ${pillEvents.pillDate}
        order by ${pillEvents.createdAt} desc
      )`.as('rn')
    })
      .from(pillEvents)
      .where(and(
        eq(pillEvents.userId, ownerId),
        gte(pillEvents.pillDate, startDate),
      ))
      .as("t");

    const query = await this.db.select({
      id: subquery.id,
      userId: subquery.userId,
      pillDate: subquery.pillDate,
      createdAt: subquery.createdAt,
      pillTaken: subquery.pillTaken
    })
      .from(subquery)
      .where(eq(subquery.rn, 1));

    return query
  }

  getPillStates(pillEvents: PillEventsSelect[]): PillStates {
    const pillStates: Record<string, boolean> = {};
    for (let i = 0; i < pillEvents.length; i++) {
      const key = pillEvents[i].pillDate;
      const value = pillEvents[i].pillTaken;
      pillStates[key] = value;
    }
    return pillStates;
  }
}
export const pillEventsService = new PillEventsService(db)
