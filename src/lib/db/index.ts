import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.aswefqrejqbhujjybgex:520372e54bba9d399fca752c0deb97f7@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool, { schema });
export { pool };
