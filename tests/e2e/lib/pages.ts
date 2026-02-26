import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { UI_TIMEOUT } from './config'

export async function expectTaskListVisible(window: Page): Promise<void> {
  await expect(window.locator('#root')).toBeVisible({ timeout: UI_TIMEOUT })
  await expect(window.getByText('Задачи')).toBeVisible({ timeout: UI_TIMEOUT })
  await expect(window.getByTestId('add-task-card')).toBeVisible({
    timeout: UI_TIMEOUT,
  })
}

export async function expectTaskPageVisible(window: Page): Promise<void> {
  await expect(
    window.getByRole('textbox', {
      name: 'Название',
    })
  ).toBeVisible({ timeout: UI_TIMEOUT })
}
