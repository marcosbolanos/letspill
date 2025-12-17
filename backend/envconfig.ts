import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env.development';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.coerce.number(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  DATABASE_ENDPOINT: z.string(),
  DATABASE_PORT: z.string(),
  DATABASE_NAME: z.string(),
  DATABASE_CONNECTION_STRING: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  FRONTEND_URL: z.string(),
});

// Load config and throw an error if something is missing
const ENV_CONFIG = envSchema.parse(process.env);
ENV_CONFIG.NODE_ENV = process.env.NODE_ENV;

export default ENV_CONFIG;
