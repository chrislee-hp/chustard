import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

let db = null;

export function getDb(dbPath = join(__dirname, 'app.db')) {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDb(dbPath) {
  const database = getDb(dbPath);
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  database.exec(schema);
  return database;
}

export function seedDb(dbPath) {
  const database = getDb(dbPath);
  const seed = readFileSync(join(__dirname, 'seed.sql'), 'utf-8');
  database.exec(seed);
  return database;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

export function resetDb() {
  db = null;
}
