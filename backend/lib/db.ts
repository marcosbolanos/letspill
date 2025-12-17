import { drizzle } from 'drizzle-orm/node-postgres';
import CONFIG from '../envconfig';

const connectionString = "postgresql://"
  + CONFIG.DB_USER
  + ":"
  + CONFIG.DB_PASSWORD
  + "@"
  + CONFIG.DB_HOST
  + ":"
  + CONFIG.DB_PORT
  + "/"
  + CONFIG.DB_NAME

export const db = drizzle(connectionString);

export type DBType = typeof db;
