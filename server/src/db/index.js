const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

let db;

function getDb(dbPath) {
  if (!db) {
    db = new Database(dbPath || path.join(__dirname, '../../data/table-order.db'));
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    db.exec(schema);
  }
  return db;
}

function closeDb() {
  if (db) { db.close(); db = null; }
}

function getTestDb() {
  const testDb = new Database(':memory:');
  testDb.pragma('foreign_keys = ON');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  testDb.exec(schema);
  return testDb;
}

module.exports = { getDb, closeDb, getTestDb };
