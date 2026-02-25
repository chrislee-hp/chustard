const express = require('express');
const cors = require('cors');
const { authMiddleware } = require('./middleware/auth');
const AdminRepository = require('./repositories/AdminRepository');
const TableRepository = require('./repositories/TableRepository');
const CategoryRepository = require('./repositories/CategoryRepository');
const MenuRepository = require('./repositories/MenuRepository');
const OrderRepository = require('./repositories/OrderRepository');
const OrderHistoryRepository = require('./repositories/OrderHistoryRepository');
const AuthService = require('./services/AuthService');
const MenuService = require('./services/MenuService');
const OrderService = require('./services/OrderService');
const TableService = require('./services/TableService');
const SSEService = require('./sse/SSEService');

function createApp(db) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const adminRepo = new AdminRepository(db);
  const tableRepo = new TableRepository(db);
  const categoryRepo = new CategoryRepository(db);
  const menuRepo = new MenuRepository(db);
  const orderRepo = new OrderRepository(db);
  const orderHistoryRepo = new OrderHistoryRepository(db);
  const sseService = new SSEService();
  const authService = new AuthService(adminRepo, tableRepo);
  const menuService = new MenuService(menuRepo, categoryRepo);
  const orderService = new OrderService(orderRepo, tableRepo, menuRepo, sseService, orderHistoryRepo);
  const tableService = new TableService(tableRepo, orderRepo, orderHistoryRepo, sseService);

  const err = (res, e) => {
    const map = { UNAUTHORIZED: 401, LOGIN_LOCKED: 423, FORBIDDEN: 403, NOT_FOUND: 404, VALIDATION_ERROR: 400 };
    const status = map[e.message] || 500;
    res.status(status).json({ error: { code: e.message, message: e.message } });
  };

  // Auth
  app.post('/api/admin/login', (req, res) => {
    try { res.json(authService.adminLogin(req.body.storeId, req.body.username, req.body.password)); }
    catch (e) { err(res, e); }
  });
  app.post('/api/table/login', (req, res) => {
    try { res.json(authService.tableLogin(req.body.storeId, req.body.tableNumber, req.body.password)); }
    catch (e) { err(res, e); }
  });
  app.get('/api/auth/verify', (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      res.json(authService.verifyToken(token));
    } catch (e) { err(res, e); }
  });

  // Menu
  app.get('/api/menus', (req, res) => {
    res.json({ categories: menuService.getMenus(req.query.storeId) });
  });
  app.post('/api/admin/menus', authMiddleware('admin'), (req, res) => {
    try { res.status(201).json({ menu: menuService.createMenu(req.body) }); }
    catch (e) { err(res, e); }
  });
  app.put('/api/admin/menus/reorder', authMiddleware('admin'), (req, res) => {
    menuService.reorderMenus(req.body.menuIds); res.json({ success: true });
  });
  app.put('/api/admin/menus/:id', authMiddleware('admin'), (req, res) => {
    try { res.json({ menu: menuService.updateMenu(req.params.id, req.body) }); }
    catch (e) { err(res, e); }
  });
  app.delete('/api/admin/menus/:id', authMiddleware('admin'), (req, res) => {
    try { menuService.deleteMenu(req.params.id); res.json({ success: true }); }
    catch (e) { err(res, e); }
  });
  app.post('/api/admin/categories', authMiddleware('admin'), (req, res) => {
    res.status(201).json({ category: menuService.createCategory(req.user.storeId, req.body.name, req.body.nameEn) });
  });
  app.put('/api/admin/categories/reorder', authMiddleware('admin'), (req, res) => {
    menuService.reorderCategories(req.body.categoryIds); res.json({ success: true });
  });
  app.put('/api/admin/categories/:id', authMiddleware('admin'), (req, res) => {
    try { res.json({ category: menuService.updateCategory(req.params.id, req.body.name, req.body.nameEn) }); }
    catch (e) { err(res, e); }
  });
  app.delete('/api/admin/categories/:id', authMiddleware('admin'), (req, res) => {
    try { menuService.deleteCategory(req.params.id); res.json({ success: true }); }
    catch (e) { err(res, e); }
  });
  app.put('/api/admin/categories/reorder', authMiddleware('admin'), (req, res) => {
    menuService.reorderCategories(req.body.categoryIds); res.json({ success: true });
  });

  // Order
  app.post('/api/orders', authMiddleware('table'), (req, res) => {
    try { res.status(201).json({ order: orderService.createOrder(req.body.tableId || req.user.tableId, req.body.sessionId || req.user.sessionId, req.body.items) }); }
    catch (e) { err(res, e); }
  });
  app.get('/api/orders', authMiddleware('table'), (req, res) => {
    res.json({ orders: orderService.getOrdersBySession(req.query.tableId || req.user.tableId, req.query.sessionId || req.user.sessionId) });
  });
  app.get('/api/admin/orders', authMiddleware('admin'), (req, res) => {
    res.json({ tables: orderService.getAllOrders(req.query.storeId || req.user.storeId) });
  });
  app.put('/api/admin/orders/:id/status', authMiddleware('admin'), (req, res) => {
    try { res.json({ order: orderService.updateOrderStatus(req.params.id, req.body.status) }); }
    catch (e) { err(res, e); }
  });
  app.delete('/api/admin/orders/:id', authMiddleware('admin'), (req, res) => {
    try { orderService.deleteOrder(req.params.id); res.json({ success: true }); }
    catch (e) { err(res, e); }
  });
  app.get('/api/admin/orders/history', authMiddleware('admin'), (req, res) => {
    res.json({ orders: orderService.getOrderHistory(req.user.storeId, req.query.tableId, req.query.date) });
  });

  // Table
  app.post('/api/admin/tables', authMiddleware('admin'), (req, res) => {
    try { res.status(201).json({ table: tableService.createTable(req.body.storeId || req.user.storeId, req.body.tableNumber, req.body.password) }); }
    catch (e) { err(res, e); }
  });
  app.get('/api/admin/tables', authMiddleware('admin'), (req, res) => {
    res.json({ tables: tableService.getTables(req.query.storeId || req.user.storeId) });
  });
  app.post('/api/admin/tables/:id/complete', authMiddleware('admin'), (req, res) => {
    try { tableService.completeTable(req.params.id); res.json({ success: true }); }
    catch (e) { err(res, e); }
  });

  // SSE
  app.get('/api/sse/orders', authMiddleware(), (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    const clientId = `${Date.now()}-${Math.random()}`;
    const type = req.user.role;
    const filterId = type === 'admin' ? (req.query.storeId || req.user.storeId) : req.query.tableId;
    sseService.addClient(clientId, type, filterId, res);
    res.write(':ok\n\n');
    req.on('close', () => sseService.removeClient(clientId));
  });

  return app;
}

module.exports = { createApp };
