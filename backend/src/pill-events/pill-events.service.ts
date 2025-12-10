import { eq } from 'drizzle-orm';

import { db, DBType } from '../../lib/db';
import { pillEvents } from '../db/schema/pill-events.schema';

class PillEventsService {
  constructor(private db: DBType) { }

  async getPillEvents(ownerId: string) {
    const query = await this.db.select()
      .from(pillEvents)
      .where(eq(pillEvents.userId, ownerId))
    return query
  }
}
export const pillEventsService = new PillEventsService(db)
