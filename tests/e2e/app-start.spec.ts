import { test } from './electron-fixtures'
import { expectTaskListVisible } from './lib'

test.describe('старт приложения', () => {
  test('при старте показывается список задач', async ({ window }) => {
    await expectTaskListVisible(window)
  })
})
