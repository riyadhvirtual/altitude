import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './migrations',
  schema: './db/schema.ts',
  dialect: 'pg',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
