import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// dotenv is loaded in api/index.ts (local only) or injected by Vercel

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for production deployment");
}

// Create a single Postgres client for serverless usage
export const client = postgres(process.env.DATABASE_URL, {
  // Vercel/Supabase typically require SSL; include in URL or configure here if needed
  // ssl: 'require'
  max: 1,
});

export const db = drizzle(client, { schema });

export { schema };
