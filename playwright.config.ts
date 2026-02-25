import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://localhost:5173'

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'tests/e2e/.results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'tests/e2e/report' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm run dev:vite',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
