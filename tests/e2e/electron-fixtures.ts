import type { ElectronApplication, Page } from '@playwright/test'
import {
  _electron as electron,
  expect as baseExpect,
  test as base,
} from '@playwright/test'
import fs from 'fs'
import path from 'path'

type ElectronFixtures = {
  electronApp: ElectronApplication
  window: Page
}

const TEST_USER_DATA_PATH = path.join(
  process.cwd(),
  'tests',
  'e2e',
  '.generated',
  'user-data'
)

export const test = base.extend<ElectronFixtures>({
  electronApp: async (
    // eslint-disable-next-line no-empty-pattern
    {},
    use
  ) => {
    fs.rmSync(TEST_USER_DATA_PATH, { recursive: true, force: true })

    const app = await electron.launch({
      args: [
        '.',
        `--log-owl-user-data=${TEST_USER_DATA_PATH}`,
        ...(process.env.CI ? ['--no-sandbox'] : []),
      ],
    })
    try {
      await use(app)
    } finally {
      await app.close()
    }
  },
  window: async ({ electronApp }, use) => {
    const page = await electronApp.firstWindow()
    await use(page)
  },
})

export const expect = baseExpect
