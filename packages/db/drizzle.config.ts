import { defineConfig } from 'drizzle-kit';

const url = process.env.DATABASE_URL_LOCAL ?? process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL or DATABASE_URL_LOCAL is required for drizzle-kit');

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url },
  verbose: true,
  strict: true,
});
