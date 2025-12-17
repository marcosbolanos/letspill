import { drizzle } from 'drizzle-orm/node-postgres';
import CONFIG from '../envconfig';

const connectionString = "postgresql://"
  + CONFIG.POSTGRES_USER
  + ":"
  + CONFIG.POSTGRES_PASSWORD
  + "@"
  + CONFIG.DATABASE_ENDPOINT
  + ":"
  + CONFIG.DATABASE_PORT
  + "/"
  + CONFIG.DATABASE_NAME

export const db = drizzle(connectionString);

export type DBType = typeof db;
