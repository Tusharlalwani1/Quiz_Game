import { DatabaseSync } from "node:sqlite";
import { Pool } from "@neondatabase/serverless";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING;
const useNeon = Boolean(databaseUrl);
const neonPool = useNeon ? new Pool({ connectionString: databaseUrl }) : null;
const sqliteDb = useNeon
  ? null
  : new DatabaseSync(
      process.env.DATABASE_PATH || path.join(__dirname, "quiz_database.db"),
    );

if (sqliteDb) sqliteDb.exec("PRAGMA foreign_keys = ON");

async function query(text, params = []) {
  const postgresText = text.replace(/\?/g, (_, offset, source) => {
    const before = source.slice(0, offset);
    return `$${(before.match(/\$\d+/g) || []).length + 1}`;
  });
  return (await neonPool.query(postgresText, params)).rows;
}

function prepare(text) {
  return {
    get: async (...params) => {
      if (useNeon) return (await query(text, params))[0];
      return sqliteDb.prepare(text).get(...params);
    },
    all: async (...params) => {
      if (useNeon) return query(text, params);
      return sqliteDb.prepare(text).all(...params);
    },
    run: async (...params) => {
      if (useNeon) {
        const rows = await query(text, params);
        return { lastInsertRowid: rows[0]?.id, changes: rows.length };
      }
      if (/\bRETURNING\b/i.test(text)) {
        const rows = sqliteDb.prepare(text).all(...params);
        return { lastInsertRowid: rows[0]?.id, changes: rows.length };
      }
      return sqliteDb.prepare(text).run(...params);
    },
  };
}

async function exec(text) {
  if (!useNeon) return sqliteDb.exec(text);
  for (const statement of text
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)) {
    await query(statement);
  }
}

export async function initDB() {
  const generatedId = useNeon
    ? "SERIAL PRIMARY KEY"
    : "INTEGER PRIMARY KEY AUTOINCREMENT";

  await exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id ${generatedId},
      text TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_option TEXT NOT NULL,
      question_order INTEGER NOT NULL UNIQUE,
      image_url TEXT
    );
    CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY,
      participant_name TEXT NOT NULL,
      session_id TEXT UNIQUE NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      total_score INTEGER DEFAULT 0,
      tab_switch_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'in_progress'
    );
    CREATE TABLE IF NOT EXISTS answers (
      id ${generatedId},
      attempt_id TEXT NOT NULL,
      question_id INTEGER NOT NULL,
      selected_option TEXT,
      is_correct INTEGER DEFAULT 0,
      answered_at TEXT NOT NULL,
      time_taken_seconds REAL DEFAULT 0,
      FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    );
  `);
}

await initDB();

export default { prepare, exec, isPersistent: useNeon };
