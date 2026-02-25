-- Store
CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Admin
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id),
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(store_id, username)
);

-- Login Attempts
CREATE TABLE IF NOT EXISTS login_attempts (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES admins(id),
  attempted_at TEXT NOT NULL DEFAULT (datetime('now')),
  success INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_login_attempts ON login_attempts(admin_id, attempted_at);

-- Table
CREATE TABLE IF NOT EXISTS tables (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id),
  table_number INTEGER NOT NULL,
  password TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive',
  current_session_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(store_id, table_number)
);

-- Table Session
CREATE TABLE IF NOT EXISTS table_sessions (
  id TEXT PRIMARY KEY,
  table_id TEXT NOT NULL REFERENCES tables(id),
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  ended_at TEXT
);

-- Category
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id),
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Menu
CREATE TABLE IF NOT EXISTS menus (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id),
  name_ko TEXT NOT NULL,
  name_en TEXT NOT NULL,
  desc_ko TEXT,
  desc_en TEXT,
  price INTEGER NOT NULL CHECK(price >= 1000 AND price <= 100000),
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Order
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL REFERENCES table_sessions(id),
  table_id TEXT NOT NULL REFERENCES tables(id),
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount INTEGER NOT NULL,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_session ON orders(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_id, deleted_at);

-- Order Item
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  menu_id TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  name_en TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity >= 1 AND quantity <= 99),
  price INTEGER NOT NULL
);
