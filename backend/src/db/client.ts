import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { logger } from "../lib/logger";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (err) => {
  logger.error("Unexpected pg pool error", { error: err.message });
});

export async function initDb(): Promise<void> {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
  await pool.query(sql);
  logger.info("Database initialised");
}

export async function closeDb(): Promise<void> {
  await pool.end();
}
