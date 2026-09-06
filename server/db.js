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
const isVercel = Boolean(process.env.VERCEL);

// On Vercel, the filesystem outside /tmp is read-only and non-persistent.
// If we silently fell back to a local SQLite file here (like the old code
// did), the app would either crash the whole serverless function on cold
// start (unhandled I/O error) or, if it somehow opened, lose every admin
// change on the next deploy/cold start. Instead, fail in a way that is
// visible and specific, per requirement #6: never silently use temporary
// Vercel SQLite.
let initError = null;
let neonPool = null;
let sqliteDb = null;

if (isVercel && !useNeon) {
  initError = new Error(
    "Backend configuration error: no database connection string found. " +
      "Set DATABASE_URL (or POSTGRES_URL) to your Neon Postgres connection " +
      "string in Vercel → Project Settings → Environment Variables for " +
      "Production, Preview, and Development, then redeploy.",
  );
} else if (useNeon) {
  try {
    neonPool = new Pool({ connectionString: databaseUrl });
  } catch (err) {
    initError = new Error(
      `Failed to initialize Neon Postgres connection: ${err.message}`,
    );
  }
} else {
  try {
    sqliteDb = new DatabaseSync(
      process.env.DATABASE_PATH || path.join(__dirname, "quiz_database.db"),
    );
    sqliteDb.exec("PRAGMA foreign_keys = ON");
  } catch (err) {
    initError = new Error(
      `Failed to open local SQLite database: ${err.message}`,
    );
  }
}

function assertReady() {
  if (initError) throw initError;
}

async function query(text, params = []) {
  assertReady();
  const postgresText = text.replace(/\?/g, (_, offset, source) => {
    const before = source.slice(0, offset);
    return `$${(before.match(/\$\d+/g) || []).length + 1}`;
  });
  return (await neonPool.query(postgresText, params)).rows;
}

function prepare(text) {
  return {
    get: async (...params) => {
      assertReady();
      if (useNeon) return (await query(text, params))[0];
      return sqliteDb.prepare(text).get(...params);
    },
    all: async (...params) => {
      assertReady();
      if (useNeon) return query(text, params);
      return sqliteDb.prepare(text).all(...params);
    },
    run: async (...params) => {
      assertReady();
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
  assertReady();
  if (!useNeon) return sqliteDb.exec(text);
  for (const statement of text
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)) {
    await query(statement);
  }
}

export async function initDB() {
  if (initError) return; // Nothing to create; assertReady() will surface this.

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

// Never let a database problem crash the whole serverless function at
// import time — that used to take down every route (including logins) with
// a generic Vercel error page instead of a JSON response. Instead, capture
// the error and let each route's existing try/catch report it cleanly.
try {
  await initDB();
} catch (err) {
  if (!initError) initError = err;
  console.error("Database initialization failed:", err.message);
}

export default {
  prepare,
  exec,
  isPersistent: useNeon,
  get isReady() {
    return !initError;
  },
  get error() {
    return initError ? initError.message : null;
  },
  get backend() {
    if (initError) return "not_configured";
    return useNeon ? "neon" : "sqlite";
  },
};