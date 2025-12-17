import CONFIG from 'envconfig';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema',
  dialect: 'postgresql',
  dbCredentials: {
    url: `${CONFIG.DB_CONNECTION_STRING}?sslmode=require`, // Add SSL to URL
  },
});
