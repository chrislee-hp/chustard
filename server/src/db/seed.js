const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'table-order.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

const storeId = uuidv4();
const adminId = uuidv4();
const cat1 = uuidv4(), cat2 = uuidv4();

db.prepare('INSERT OR IGNORE INTO stores (id, name) VALUES (?, ?)').run(storeId, '우리식당');
db.prepare('INSERT OR IGNORE INTO admins (id, storeId, username, passwordHash) VALUES (?, ?, ?, ?)').run(adminId, storeId, 'admin', bcrypt.hashSync('admin1234', 10));
db.prepare('INSERT OR IGNORE INTO categories (id, storeId, name, nameEn, sortOrder) VALUES (?, ?, ?, ?, ?)').run(cat1, storeId, '메인메뉴', 'Main', 0);
db.prepare('INSERT OR IGNORE INTO categories (id, storeId, name, nameEn, sortOrder) VALUES (?, ?, ?, ?, ?)').run(cat2, storeId, '음료', 'Drinks', 1);

const menus = [
  [cat1, '김치찌개', 'Kimchi Stew', '돼지고기 김치찌개', 'Pork kimchi stew', 9000, 0],
  [cat1, '된장찌개', 'Doenjang Stew', '두부 된장찌개', 'Tofu soybean paste stew', 8000, 1],
  [cat1, '비빔밥', 'Bibimbap', '야채 비빔밥', 'Mixed rice with vegetables', 10000, 2],
  [cat2, '콜라', 'Cola', '', '', 2000, 0],
  [cat2, '사이다', 'Sprite', '', '', 2000, 1],
];
for (const [catId, nk, ne, dk, de, price, sort] of menus) {
  db.prepare('INSERT INTO menus (id, categoryId, nameKo, nameEn, descKo, descEn, price, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(uuidv4(), catId, nk, ne, dk, de, price, sort);
}

console.log(`Seed complete. storeId: ${storeId}`);
console.log('Admin login: admin / admin1234');
db.close();
