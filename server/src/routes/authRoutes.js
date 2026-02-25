import { Router } from 'express';

export function createAuthRoutes(authService) {
  const router = Router();

  router.post('/admin/login', async (req, res, next) => {
    try {
      const { storeId, username, password } = req.body;
      const result = await authService.adminLogin(storeId, username, password);
      res.json(result);
    } catch (err) { next(err); }
  });

  router.post('/table/login', async (req, res, next) => {
    try {
      const { storeId, tableNumber, password } = req.body;
      const result = await authService.tableLogin(storeId, tableNumber, password);
      res.json(result);
    } catch (err) { next(err); }
  });

  router.get('/auth/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: { code: 'UNAUTHORIZED' } });

    const result = authService.verifyToken(token);
    if (!result.valid) return res.status(401).json({ error: { code: 'UNAUTHORIZED' } });
    res.json(result);
  });

  return router;
}
