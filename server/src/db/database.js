import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'app.db');

let db = null;
let SQL = null;

export async function getDb() {
  if (!db) {
    if (!SQL) SQL = await initSqlJs();
    if (existsSync(dbPath)) {
      const buffer = readFileSync(dbPath);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }
    // Foreign key 활성화
    db.run('PRAGMA foreign_keys = ON');
  }
  return db;
}

export function saveDb() {
  if (db) {
    const data = db.export();
    writeFileSync(dbPath, Buffer.from(data));
  }
}

export async function initDb() {
  const database = await getDb();
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  database.exec(schema);  // exec로 여러 문 실행
  saveDb();
  return database;
}

export async function seedDb() {
  const database = await getDb();
  const seed = readFileSync(join(__dirname, 'seed.sql'), 'utf-8');
  database.exec(seed);  // exec로 여러 문 실행
  saveDb();
  return database;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

export function transaction(db, callback) {
  db.run('BEGIN');
  try {
    const result = callback();
    db.run('COMMIT');
    saveDb();
    return result;
  } catch (err) {
    try { db.run('ROLLBACK'); } catch (e) { /* ignore */ }
    throw err;
  }
}

// sql.js용 헬퍼 - better-sqlite3 호환 인터페이스
export function createStatement(db, sql) {
  return {
    run(...params) {
      // params가 배열로 전달되도록 flatten
      const flatParams = params.flat();
      db.run(sql, flatParams);
      saveDb();
      const result = db.exec("SELECT last_insert_rowid() as id");
      const lastId = result[0]?.values[0]?.[0];
      return { lastInsertRowid: lastId };
    },
    get(...params) {
      const flatParams = params.flat();
      const stmt = db.prepare(sql);
      stmt.bind(flatParams);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row;
      }
      stmt.free();
      return null;
    },
    all(...params) {
      const flatParams = params.flat();
      const stmt = db.prepare(sql);
      stmt.bind(flatParams);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return rows;
    }
  };
}
