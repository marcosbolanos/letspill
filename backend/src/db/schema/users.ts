import { timestamptz } from "drizzle-orm/gel-core"
import { pgTable, integer, varchar, uuid, timestamp } from "drizzle-orm/pg-core"

export const users = pgTable('users', {
  id: uuid(),
  name: varchar(),
  dateAdded: timestamptz(),
  email: varchar(),
  passwordHash: varchar()
})
