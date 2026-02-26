import { defineConfig } from '@playwright/test'

const baseURL = 'http://localhost:5173'

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'tests/e2e/.generated/results',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { outputFolder: 'tests/e2e/.generated/report' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'electron' }],
  webServer: {
    command: 'pnpm run dev:vite',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
