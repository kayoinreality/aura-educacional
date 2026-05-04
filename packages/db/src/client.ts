import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export { sql } from 'drizzle-orm';

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Cliente Drizzle singleton.
 * Em Cloud Run, conexão via Cloud SQL Auth Proxy (Unix socket) ou IP privado (VPC).
 * Em dev local, conecta direto no Postgres do docker-compose.
 */
export function getDb() {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');

  const queryClient = postgres(url, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  _db = drizzle(queryClient, { schema });
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop) {
    return Reflect.get(getDb() as object, prop);
  },
});
