import { initDb, seedDb, getDb } from './database.js';
import bcrypt from 'bcrypt';

(async () => {
  console.log('Initializing database...');
  initDb();
  console.log('Seeding database...');
  seedDb();
  
  // Admin 계정 생성 (bcrypt 해시)
  const db = getDb();
  const passwordHash = await bcrypt.hash('admin1234', 10);
  db.prepare(`INSERT OR IGNORE INTO admins (id, store_id, username, password_hash) VALUES (?, ?, ?, ?)`)
    .run('admin-001', 'store-001', 'admin', passwordHash);
  
  console.log('Database initialized successfully.');
})();
