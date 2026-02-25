import { Router } from 'express';
import { requireAdmin, requireTable } from '../middleware/auth.js';

export function createOrderRoutes(orderService, authMiddleware) {
  const router = Router();

  router.post('/orders', authMiddleware, requireTable, (req, res, next) => {
    try {
      const { tableId, sessionId } = req.user;
      const { items } = req.body;
      const order = orderService.createOrder(tableId, sessionId, items);
      res.status(201).json({ order, orderId: order.id });
    } catch (err) { next(err); }
  });

  router.get('/orders', authMiddleware, requireTable, (req, res) => {
    const { tableId, sessionId } = req.user;
    const orders = orderService.getOrdersBySession(tableId, sessionId);
    res.json({ orders });
  });

  router.get('/admin/orders', authMiddleware, requireAdmin, (req, res) => {
    const tables = orderService.getAdminDashboard(req.user.storeId);
    res.json({ tables });
  });

  router.get('/admin/orders/history', authMiddleware, requireAdmin, (req, res) => {
    res.json({ history: [] });
  });

  router.put('/admin/orders/:id/status', authMiddleware, requireAdmin, (req, res, next) => {
    try {
      const order = orderService.updateOrderStatus(parseInt(req.params.id), req.body.status);
      res.json({ order });
    } catch (err) { next(err); }
  });

  router.delete('/admin/orders/:id', authMiddleware, requireAdmin, (req, res, next) => {
    try {
      orderService.deleteOrder(parseInt(req.params.id));
      res.json({ success: true });
    } catch (err) { next(err); }
  });

  return router;
}
