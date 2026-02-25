-- Default Store
INSERT OR IGNORE INTO stores (id, name) VALUES ('store-001', '테스트 매장');

-- Default Admin (password: admin1234)
INSERT OR IGNORE INTO admins (id, store_id, username, password_hash) 
VALUES ('admin-001', 'store-001', 'admin', '$2b$10$rQZ8K.XqK1Y5J5Z5Z5Z5ZuZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z');

-- Sample Categories
INSERT OR IGNORE INTO categories (id, store_id, name, sort_order) VALUES 
('cat-001', 'store-001', '메인 메뉴', 1),
('cat-002', 'store-001', '사이드', 2),
('cat-003', 'store-001', '음료', 3);

-- Sample Menus
INSERT OR IGNORE INTO menus (id, category_id, name_ko, name_en, desc_ko, desc_en, price, sort_order) VALUES
('menu-001', 'cat-001', '불고기', 'Bulgogi', '달콤한 양념 소고기', 'Sweet marinated beef', 15000, 1),
('menu-002', 'cat-001', '비빔밥', 'Bibimbap', '야채와 고추장 비빔밥', 'Mixed rice with vegetables', 12000, 2),
('menu-003', 'cat-002', '김치', 'Kimchi', '전통 배추김치', 'Traditional cabbage kimchi', 3000, 1),
('menu-004', 'cat-003', '콜라', 'Cola', NULL, NULL, 2000, 1);

-- Sample Table
INSERT OR IGNORE INTO tables (id, store_id, table_number, password, status) VALUES
('table-001', 'store-001', 1, '1234', 'inactive');
