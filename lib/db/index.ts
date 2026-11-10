import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

let db: Database | null = null;

// Lazy so importing this module at build time never needs DATABASE_URL.
export function getDb() {
  if (!db) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
    // prepare:false + small pool keep this safe behind Neon's / Supabase's pooler.
    const client = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
    db = drizzle(client, { schema });
  }
  return db;
}

export { schema };
