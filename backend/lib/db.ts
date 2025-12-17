import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import CONFIG from '../envconfig';

const pool = new Pool({
  connectionString: CONFIG.DB_CONNECTION_STRING!,
})

export const db = drizzle({ client: pool });

export type DBType = typeof db;
