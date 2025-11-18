import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";

// For Vercel serverless, Neon works directly with fetch API
// No WebSocket constructor needed in serverless environments
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a pool for serverless functions
// Neon's serverless driver handles connection pooling automatically
// The pool is reused across invocations in the same container
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

