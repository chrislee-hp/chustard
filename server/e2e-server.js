// Playwright E2E 전용 서버 - 인메모리 DB + 시드 데이터
const { createApp } = require('./src/app');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = new Database(':memory:');
db.pragma('foreign_keys = ON');
db.exec(fs.readFileSync(path.join(__dirname, 'src/db/schema.sql'), 'utf8'));

// 시드
const storeId = 'test-store-id';
db.prepare('INSERT INTO stores (id, name) VALUES (?, ?)').run(storeId, '테스트식당');
db.prepare('INSERT INTO admins (id, storeId, username, passwordHash) VALUES (?, ?, ?, ?)').run(uuidv4(), storeId, 'admin', bcrypt.hashSync('admin1234', 10));
db.prepare('INSERT INTO tables (id, storeId, tableNumber, passwordHash) VALUES (?, ?, ?, ?)').run('table-1', storeId, 1, bcrypt.hashSync('1234', 10));
db.prepare('INSERT INTO tables (id, storeId, tableNumber, passwordHash) VALUES (?, ?, ?, ?)').run('table-2', storeId, 2, bcrypt.hashSync('1234', 10));

const cat1 = uuidv4(), cat2 = uuidv4();
db.prepare('INSERT INTO categories (id, storeId, name, nameEn, sortOrder) VALUES (?, ?, ?, ?, ?)').run(cat1, storeId, '메인메뉴', 'Main', 0);
db.prepare('INSERT INTO categories (id, storeId, name, nameEn, sortOrder) VALUES (?, ?, ?, ?, ?)').run(cat2, storeId, '음료', 'Drinks', 1);

const menus = [
  [cat1, '김치찌개', 'Kimchi Stew', 9000], [cat1, '된장찌개', 'Doenjang Stew', 8000],
  [cat2, '콜라', 'Cola', 2000], [cat2, '사이다', 'Sprite', 2000],
];
menus.forEach(([catId, nk, ne, price], i) => {
  db.prepare('INSERT INTO menus (id, categoryId, nameKo, nameEn, price, sortOrder) VALUES (?, ?, ?, ?, ?, ?)').run(uuidv4(), catId, nk, ne, price, i);
});

const app = createApp(db);

// Customer SPA 정적 파일 서빙
const customerDist = path.join(__dirname, '../client/customer/dist');
const adminDist = path.join(__dirname, '../client/admin/dist');
const express = require('express');
if (fs.existsSync(customerDist)) app.use('/customer', express.static(customerDist));
if (fs.existsSync(adminDist)) app.use('/admin', express.static(adminDist));

// SPA fallback
app.get('/customer/*', (req, res) => res.sendFile(path.join(customerDist, 'index.html')));
app.get('/admin/*', (req, res) => res.sendFile(path.join(adminDist, 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`E2E server on http://localhost:${PORT}`);
  console.log(`storeId: ${storeId}`);
});

process.on('SIGINT', () => { db.close(); process.exit(); });
