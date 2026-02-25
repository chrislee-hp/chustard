import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, '../src/db/schema.sql');

let testDb = null;

export function getTestDb() {
  if (!testDb) {
    testDb = new Database(':memory:');
    testDb.pragma('foreign_keys = ON');
    const schema = readFileSync(schemaPath, 'utf-8');
    testDb.exec(schema);
  }
  return testDb;
}

export function resetTestDb() {
  if (testDb) {
    testDb.close();
    testDb = null;
  }
}

beforeEach(() => {
  resetTestDb();
});

afterAll(() => {
  resetTestDb();
});
