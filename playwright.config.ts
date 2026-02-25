import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
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
  ],
  webServer: [
    {
      command: 'npm run dev:customer',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
    },
  ],
})
