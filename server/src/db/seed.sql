-- Default Store
INSERT OR IGNORE INTO stores (id, name) VALUES ('store-001', '테스트 매장');

-- Default Admin은 init.js에서 bcrypt로 생성

-- Sample Categories
INSERT OR IGNORE INTO categories (id, store_id, name, sort_order) VALUES 
('cat-001', 'store-001', '메인 메뉴', 1),
('cat-002', 'store-001', '사이드', 2),
('cat-003', 'store-001', '음료', 3);

-- Sample Menus
INSERT OR IGNORE INTO menus (id, category_id, name_ko, name_en, desc_ko, desc_en, price, image_url, sort_order) VALUES
('menu-001', 'cat-001', '불고기', 'Bulgogi', '달콤한 양념 소고기', 'Sweet marinated beef', 15000, 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400', 1),
('menu-002', 'cat-001', '비빔밥', 'Bibimbap', '야채와 고추장 비빔밥', 'Mixed rice with vegetables', 12000, 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=400', 2),
('menu-003', 'cat-001', '김치찌개', 'Kimchi Stew', '돼지고기와 김치가 들어간 얼큰한 찌개', 'Spicy stew with pork and kimchi', 9000, 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400', 3),
('menu-004', 'cat-001', '된장찌개', 'Doenjang Stew', '구수한 된장과 두부가 들어간 찌개', 'Soybean paste stew with tofu', 8000, 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400', 4),
('menu-005', 'cat-001', '삼겹살', 'Samgyeopsal', '두툼한 국내산 삼겹살', 'Thick-cut pork belly', 18000, 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400', 5),
('menu-006', 'cat-001', '제육볶음', 'Jeyuk Bokkeum', '매콤한 돼지고기 볶음', 'Spicy stir-fried pork', 11000, 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?w=400', 6),
('menu-007', 'cat-001', '순두부찌개', 'Sundubu Jjigae', '부드러운 순두부와 해물이 들어간 찌개', 'Soft tofu stew with seafood', 9000, 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400', 7),
('menu-008', 'cat-001', '갈비탕', 'Galbitang', '소갈비가 들어간 맑은 국물', 'Beef short rib soup', 14000, 'https://images.unsplash.com/photo-1583224994076-0a3f2f068f9a?w=400', 8),
('menu-009', 'cat-001', '삼계탕', 'Samgyetang', '영계에 인삼, 대추를 넣어 끓인 보양식', 'Ginseng chicken soup', 16000, 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400', 9),
('menu-010', 'cat-001', '잡채', 'Japchae', '당면과 야채를 볶은 전통 요리', 'Stir-fried glass noodles with vegetables', 10000, 'https://images.unsplash.com/photo-1633478062482-790e3bb22929?w=400', 10),
('menu-011', 'cat-002', '김치', 'Kimchi', '전통 배추김치', 'Traditional cabbage kimchi', 3000, 'https://images.unsplash.com/photo-1583224994076-0a3f2f068f9a?w=400', 1),
('menu-012', 'cat-002', '계란찜', 'Steamed Egg', '부드러운 계란찜', 'Soft steamed egg', 4000, 'https://images.unsplash.com/photo-1482049016gy-2d3d8ab4b2e5?w=400', 2),
('menu-013', 'cat-002', '공기밥', 'Rice', '흰 쌀밥', 'Steamed white rice', 1000, 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400', 3),
('menu-014', 'cat-002', '된장국', 'Doenjang Soup', '구수한 된장국', 'Soybean paste soup', 2000, 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400', 4),
('menu-015', 'cat-003', '콜라', 'Cola', NULL, NULL, 2000, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400', 1),
('menu-016', 'cat-003', '사이다', 'Sprite', NULL, NULL, 2000, 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400', 2),
('menu-017', 'cat-003', '소주', 'Soju', '참이슬', 'Korean distilled spirit', 5000, 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400', 3),
('menu-018', 'cat-003', '맥주', 'Beer', '카스', 'Korean beer', 5000, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', 4);

-- Sample Table
INSERT OR IGNORE INTO tables (id, store_id, table_number, password, status) VALUES
('table-001', 'store-001', 1, '1234', 'inactive');
