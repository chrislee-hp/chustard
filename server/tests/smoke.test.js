const { getTestDb } = require('../src/db');

describe('Skeleton smoke test', () => {
  test('DB schema loads without error', () => {
    const db = getTestDb();
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    expect(tables.length).toBeGreaterThan(0);
    db.close();
  });
});
