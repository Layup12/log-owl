import { expect, test } from '@playwright/test'

test.describe('старт приложения', () => {
  test('главная страница загружается', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#root')).toBeVisible({ timeout: 10_000 })
  })
})
