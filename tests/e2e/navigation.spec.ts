import { expect, test } from './electron-fixtures'
import {
  BASE_URL,
  expectTaskListVisible,
  expectTaskPageVisible,
  UI_TIMEOUT,
} from './lib'

test.describe('навигация по маршрутам', () => {
  test('с главной можно перейти на страницу новой задачи по клику', async ({
    window,
  }) => {
    await expectTaskListVisible(window)
    const createCard = window.getByTestId('add-task-card')
    await expect(createCard).toBeVisible({ timeout: UI_TIMEOUT })
    await createCard.click()
    await expectTaskPageVisible(window)
  })

  test('несуществующая задача показывает ошибку', async ({ window }) => {
    await window.goto(`${BASE_URL}/#/task/999999`)
    await expect(window.locator('#root')).toBeVisible({ timeout: UI_TIMEOUT })
    await expect(window.getByText(/Задача не найдена|Неверный id/)).toBeVisible(
      {
        timeout: UI_TIMEOUT,
      }
    )
  })

  test('можно открыть задачу из списка после создания новой', async ({
    window,
  }) => {
    await expectTaskListVisible(window)

    const taskCardsBefore = window.getByTestId('task-card')
    const tasksBefore = await taskCardsBefore.count()

    const createCard = window.getByTestId('add-task-card')
    await expect(createCard).toBeVisible({ timeout: UI_TIMEOUT })
    await createCard.click()
    await expectTaskPageVisible(window)

    const titleInput = window.getByRole('textbox', { name: 'Название' })
    const taskTitle = `Новая задача ${Date.now()}`
    await titleInput.fill(taskTitle)
    await titleInput.blur()

    const backButton = window.getByRole('button', { name: 'Назад' })
    await backButton.click()
    await expect(window.getByText('Задачи')).toBeVisible({
      timeout: UI_TIMEOUT,
    })

    const taskCards = window.getByTestId('task-card')
    await expect(taskCards).toHaveCount(tasksBefore + 1)

    const lastTask = taskCards.last()
    await expect(lastTask).toBeVisible({ timeout: UI_TIMEOUT })
    await expect(lastTask).toContainText(taskTitle)

    await lastTask.click()
    await expectTaskPageVisible(window)
    await expect(window.getByRole('textbox', { name: 'Название' })).toHaveValue(
      taskTitle
    )
  })
})
