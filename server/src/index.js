import { createApp } from './app.js';
import { initDb, seedDb, getDb } from './db/database.js';
import { authMiddleware } from './middleware/auth.js';

import { AdminRepository } from './repositories/adminRepository.js';
import { TableRepository } from './repositories/tableRepository.js';
import { TableSessionRepository } from './repositories/tableSessionRepository.js';
import { CategoryRepository } from './repositories/categoryRepository.js';
import { MenuRepository } from './repositories/menuRepository.js';
import { OrderRepository } from './repositories/orderRepository.js';
import { OrderItemRepository } from './repositories/orderItemRepository.js';
import { LoginAttemptRepository } from './repositories/loginAttemptRepository.js';

import { AuthService } from './services/authService.js';
import { MenuService } from './services/menuService.js';
import { OrderService } from './services/orderService.js';
import { TableService } from './services/tableService.js';
import { SSEService } from './services/sseService.js';

import { createAuthRoutes } from './routes/authRoutes.js';
import { createMenuRoutes } from './routes/menuRoutes.js';
import { createOrderRoutes } from './routes/orderRoutes.js';
import { createTableRoutes } from './routes/tableRoutes.js';
import { createSSERoutes } from './routes/sseRoutes.js';

const JWT_SECRET = process.env.JWT_SECRET || 
  (process.env.NODE_ENV !== 'production' ? 'dev-secret-key' : null);

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required in production');
}

const PORT = process.env.PORT || 3000;

// Initialize DB
initDb();
seedDb();
const db = getDb();

// Repositories
const adminRepo = new AdminRepository(db);
const tableRepo = new TableRepository(db);
const sessionRepo = new TableSessionRepository(db);
const categoryRepo = new CategoryRepository(db);
const menuRepo = new MenuRepository(db);
const orderRepo = new OrderRepository(db);
const orderItemRepo = new OrderItemRepository(db);
const loginAttemptRepo = new LoginAttemptRepository(db);

// Services
const sseService = new SSEService();
const authService = new AuthService(adminRepo, tableRepo, sessionRepo, loginAttemptRepo, JWT_SECRET);
const menuService = new MenuService(categoryRepo, menuRepo);
const orderService = new OrderService(orderRepo, orderItemRepo, menuRepo, tableRepo, sseService);
const tableService = new TableService(tableRepo, sessionRepo, sseService);

// Middleware
const auth = authMiddleware(JWT_SECRET);

// Routes
const routes = {
  auth: createAuthRoutes(authService),
  menu: createMenuRoutes(menuService, auth),
  order: createOrderRoutes(orderService, auth),
  table: createTableRoutes(tableService, auth),
  sse: createSSERoutes(sseService, auth)
};

const app = createApp(routes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
