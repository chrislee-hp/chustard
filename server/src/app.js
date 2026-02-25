import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { errorHandler } from './middleware/errorHandler.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function createApp(routes) {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.static(join(__dirname, '..', 'public')));

  app.use('/api', routes.auth);
  app.use('/api', routes.menu);
  app.use('/api', routes.order);
  app.use('/api', routes.table);
  app.use('/api', routes.sse);

  app.use(errorHandler);

  return app;
}
