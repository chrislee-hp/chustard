import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function createSSERoutes(sseService, authMiddleware) {
  const router = Router();

  router.get('/sse/orders', authMiddleware, (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const clientId = uuidv4();
    const { role, storeId, tableId } = req.user;

    sseService.subscribe(clientId, role, storeId, tableId, res);
    res.write(`event: connected\ndata: ${JSON.stringify({ clientId })}\n\n`);
  });

  return router;
}
