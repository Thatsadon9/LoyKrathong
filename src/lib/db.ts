import "server-only";
import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";

declare global {
  var __loyKrathongPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Run `neon env pull` or add it in Vercel.");
  }
  const pool = new Pool({
    // pg treats sslmode=require as verify-full and warns; say it explicitly.
    connectionString: connectionString.replace("sslmode=require", "sslmode=verify-full"),
    max: 5,
    idleTimeoutMillis: 5_000,
  });
  // On Vercel Fluid compute, lets idle clients close before the instance suspends.
  attachDatabasePool(pool);
  return pool;
}

export function getPool(): Pool {
  globalThis.__loyKrathongPool ??= createPool();
  return globalThis.__loyKrathongPool;
}
