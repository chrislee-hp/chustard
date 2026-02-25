import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp(routes) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api', routes.auth);
  app.use('/api', routes.menu);
  app.use('/api', routes.order);
  app.use('/api', routes.table);
  app.use('/api', routes.sse);

  app.use(errorHandler);

  return app;
}
