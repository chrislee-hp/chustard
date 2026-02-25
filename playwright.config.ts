import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
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
      name: 'admin',
      testDir: './client/admin/e2e',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3002'
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
})
