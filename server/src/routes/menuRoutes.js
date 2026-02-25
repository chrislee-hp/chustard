import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';

export function createMenuRoutes(menuService, authMiddleware) {
  const router = Router();

  router.get('/menus', (req, res) => {
    const { storeId } = req.query;
    const result = menuService.getMenus(storeId);
    res.json(result);
  });

  router.post('/admin/menus', authMiddleware, requireAdmin, async (req, res, next) => {
    try {
      const menu = await menuService.createMenu(req.body);
      res.status(201).json({ menu });
    } catch (err) { next(err); }
  });

  router.put('/admin/menus/:id', authMiddleware, requireAdmin, async (req, res, next) => {
    try {
      const menu = menuService.updateMenu(req.params.id, req.body);
      res.json({ menu });
    } catch (err) { next(err); }
  });

  router.delete('/admin/menus/:id', authMiddleware, requireAdmin, (req, res, next) => {
    try {
      menuService.deleteMenu(req.params.id);
      res.json({ success: true });
    } catch (err) { next(err); }
  });

  router.put('/admin/menus/reorder', authMiddleware, requireAdmin, (req, res) => {
    menuService.reorderMenus(req.body.menuIds);
    res.json({ success: true });
  });

  router.post('/admin/categories', authMiddleware, requireAdmin, (req, res) => {
    const category = menuService.createCategory(req.user.storeId, req.body.name);
    res.status(201).json({ category });
  });

  router.put('/admin/categories/:id', authMiddleware, requireAdmin, (req, res, next) => {
    try {
      const category = menuService.updateCategory(req.params.id, req.body.name);
      res.json({ category });
    } catch (err) { next(err); }
  });

  router.delete('/admin/categories/:id', authMiddleware, requireAdmin, (req, res, next) => {
    try {
      menuService.deleteCategory(req.params.id);
      res.json({ success: true });
    } catch (err) { next(err); }
  });

  router.put('/admin/categories/reorder', authMiddleware, requireAdmin, (req, res) => {
    menuService.reorderCategories(req.body.categoryIds);
    res.json({ success: true });
  });

  return router;
}
