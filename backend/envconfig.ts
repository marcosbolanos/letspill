import 'dotenv/config'
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.coerce.number(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_NAME: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  FRONTEND_URL: z.string(),
  DB_CONNECTION_STRING: z.string().optional()
});



// Load config and throw an error if something is missing
const ENV_CONFIG = envSchema.parse(process.env);

const connectionString = "postgresql://"
  + ENV_CONFIG.DB_USER
  + ":"
  + ENV_CONFIG.DB_PASSWORD
  + "@"
  + ENV_CONFIG.DB_HOST
  + ":"
  + ENV_CONFIG.DB_PORT
  + "/"
  + ENV_CONFIG.DB_NAME
  + "?sslmode=disable"

ENV_CONFIG.NODE_ENV = process.env.NODE_ENV;
ENV_CONFIG.DB_CONNECTION_STRING = connectionString

export default ENV_CONFIG;


