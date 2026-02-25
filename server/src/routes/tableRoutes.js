import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';

export function createTableRoutes(tableService, authMiddleware) {
  const router = Router();

  router.post('/admin/tables', authMiddleware, requireAdmin, (req, res, next) => {
    try {
      const { tableNumber, password } = req.body;
      const table = tableService.createTable(req.user.storeId, tableNumber, password);
      res.status(201).json({ table });
    } catch (err) { next(err); }
  });

  router.get('/admin/tables', authMiddleware, requireAdmin, (req, res) => {
    const tables = tableService.getTables(req.user.storeId);
    res.json({ tables });
  });

  router.post('/admin/tables/:id/complete', authMiddleware, requireAdmin, (req, res, next) => {
    try {
      tableService.completeTable(req.params.id);
      res.json({ success: true });
    } catch (err) { next(err); }
  });

  return router;
}
