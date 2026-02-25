import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Integration tests need to run sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Run integration tests one at a time
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'customer',
      testDir: './e2e/customer',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3001'
      },
    },
    {
      name: 'integration',
      testDir: './e2e/integration',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },
  ],
  // Assume servers are already running for integration tests
  // Start manually: npm run dev:server, npm run dev:customer, npm run dev:admin
})
