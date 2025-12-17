import { drizzle } from 'drizzle-orm/node-postgres';
import CONFIG from '../envconfig';

export const db = drizzle(CONFIG.DB_CONNECTION_STRING!);

export type DBType = typeof db;
