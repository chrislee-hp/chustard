CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  storeId TEXT NOT NULL REFERENCES stores(id),
  username TEXT NOT NULL,
  passwordHash TEXT NOT NULL,
  failedAttempts INTEGER DEFAULT 0,
  lockedUntil TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(storeId, username)
);

CREATE TABLE IF NOT EXISTS tables (
  id TEXT PRIMARY KEY,
  storeId TEXT NOT NULL REFERENCES stores(id),
  tableNumber INTEGER NOT NULL,
  passwordHash TEXT NOT NULL,
  status TEXT DEFAULT 'inactive',
  currentSessionId TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(storeId, tableNumber)
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  storeId TEXT NOT NULL REFERENCES stores(id),
  name TEXT NOT NULL,
  nameEn TEXT DEFAULT '',
  sortOrder INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS menus (
  id TEXT PRIMARY KEY,
  categoryId TEXT NOT NULL REFERENCES categories(id),
  nameKo TEXT NOT NULL,
  nameEn TEXT NOT NULL,
  descKo TEXT DEFAULT '',
  descEn TEXT DEFAULT '',
  price INTEGER NOT NULL CHECK(price >= 0),
  imageUrl TEXT DEFAULT '',
  sortOrder INTEGER DEFAULT 0,
  isAvailable INTEGER DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  tableId TEXT NOT NULL REFERENCES tables(id),
  sessionId TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  totalAmount INTEGER NOT NULL,
  isDeleted INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  orderId TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menuId TEXT NOT NULL,
  nameKo TEXT NOT NULL,
  nameEn TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity >= 1)
);

CREATE TABLE IF NOT EXISTS order_history (
  id TEXT PRIMARY KEY,
  storeId TEXT NOT NULL,
  tableNumber INTEGER NOT NULL,
  sessionId TEXT NOT NULL,
  ordersJson TEXT NOT NULL,
  totalAmount INTEGER NOT NULL,
  completedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
