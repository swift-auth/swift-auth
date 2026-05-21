
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/better-sqlite3';

export const db = drizzle({ connection: { source: process.env.SQLITE_URL ?? './sqlite-test.db' } });