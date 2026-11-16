import { DatabaseSync } from 'node:sqlite'

export function openDb(file = process.env.DB_FILE ?? 'codearena.db') {
  const db = new DatabaseSync(file)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL, username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL, passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'learner', createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS password_resets (
      email TEXT PRIMARY KEY, otpHash TEXT NOT NULL, expiresAt INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS problems (
      id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL,
      difficulty TEXT NOT NULL, tags TEXT NOT NULL, statement TEXT NOT NULL,
      constraints TEXT NOT NULL, hints TEXT NOT NULL, examples TEXT NOT NULL,
      starterCode TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS testcases (
      id INTEGER PRIMARY KEY, problemSlug TEXT NOT NULL, input TEXT NOT NULL,
      expected TEXT NOT NULL, visibility TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY, userId INTEGER NOT NULL, problemSlug TEXT NOT NULL,
      language TEXT NOT NULL, sourceCode TEXT NOT NULL, action TEXT NOT NULL,
      status TEXT NOT NULL, verdict TEXT, createdAt TEXT NOT NULL
    );
  `)
  // Added after first release: profile photo as a small data URL.
  if (!db.prepare("SELECT 1 FROM pragma_table_info('users') WHERE name='avatar'").get()) db.exec('ALTER TABLE users ADD COLUMN avatar TEXT')
  return db
}
