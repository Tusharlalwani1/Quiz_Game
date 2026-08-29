import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'quiz_database.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec(`PRAGMA foreign_keys = ON;`);

// Create tables
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_option TEXT NOT NULL,
      question_order INTEGER NOT NULL UNIQUE
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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attempt_id TEXT NOT NULL,
      question_id INTEGER NOT NULL,
      selected_option TEXT,
      is_correct INTEGER DEFAULT 0,
      answered_at TEXT NOT NULL,
      time_taken_seconds REAL DEFAULT 0,
      FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id)
    );
  `);
}

initDB();

export default db;
