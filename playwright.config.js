import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: { headless: true, screenshot: 'only-on-failure' },
  webServer: [
    { command: 'node server/e2e-server.js', port: 3000, reuseExistingServer: false },
    { command: 'npx vite --port 5173', cwd: 'client/customer', port: 5173, reuseExistingServer: false },
    { command: 'npx vite --port 5174', cwd: 'client/admin', port: 5174, reuseExistingServer: false },
  ],
  projects: [
    { name: 'customer', testMatch: 'customer.spec.js', use: { baseURL: 'http://localhost:5173' } },
    { name: 'admin', testMatch: 'admin.spec.js', use: { baseURL: 'http://localhost:5174' } },
  ],
});
