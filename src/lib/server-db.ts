import { Pool } from 'pg';

declare global {
  var __hemmaPgPool: Pool | undefined;
}

function getConnectionString() {
  const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || process.env.DB_URL;

  if (!connectionString) {
    throw new Error('A Postgres connection string is required for auth verification flows.');
  }

  return connectionString;
}

export function getServerDbPool() {
  if (!global.__hemmaPgPool) {
    const connectionString = getConnectionString();
    const isLocal = connectionString.includes('127.0.0.1') || connectionString.includes('localhost');

    global.__hemmaPgPool = new Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
    });
  }

  return global.__hemmaPgPool;
}
