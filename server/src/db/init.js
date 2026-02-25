import { initDb, seedDb, getDb } from './database.js';
import bcrypt from 'bcrypt';

(async () => {
  console.log('Initializing database...');
  await initDb();
  console.log('Seeding database...');
  await seedDb();
  
  // Admin 계정 생성 (bcrypt 해시)
  const db = await getDb();
  const passwordHash = await bcrypt.hash('admin1234', 10);
  db.run(`INSERT OR IGNORE INTO admins (id, store_id, username, password_hash) VALUES (?, ?, ?, ?)`,
    ['admin-001', 'store-001', 'admin', passwordHash]);
  
  const { saveDb } = await import('./database.js');
  saveDb();
  
  console.log('Database initialized successfully.');
})();
