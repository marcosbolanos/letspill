import { eq } from 'drizzle-orm';
import { db } from '../../lib/db';
import { pillEvents } from '../db/schema/pill-events.schema';
class PillEventsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getPillEvents(ownerId) {
        const query = await this.db.select()
            .from(pillEvents)
            .where(eq(pillEvents.userId, ownerId));
        return query;
    }
}
export const pillEventsService = new PillEventsService(db);
