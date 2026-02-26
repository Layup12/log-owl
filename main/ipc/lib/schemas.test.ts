import { describe, expect, it } from 'vitest'

import {
  taskInsertSchema,
  taskSessionInsertSchema,
  taskUpdateSchema,
  timeEntryInsertSchema,
} from './schemas'

describe('taskInsertSchema', () => {
  it('принимает валидный объект с title', () => {
    const result = taskInsertSchema.safeParse({
      title: 'My task',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('My task')
      expect(result.data.comment).toBeUndefined()
      expect(result.data.completed_at).toBeUndefined()
    }
  })

  it('принимает объект с comment и completed_at', () => {
    const result = taskInsertSchema.safeParse({
      title: 'Done task',
      comment: 'Note',
      completed_at: '2025-01-01T12:00:00.000Z',
    })
    expect(result.success).toBe(true)
  })

  it('принимает пустой title', () => {
    const result = taskInsertSchema.safeParse({ title: '' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('')
    }
  })

  it('отклоняет объект, если title не строка', () => {
    const result = taskInsertSchema.safeParse({ title: 123 })
    expect(result.success).toBe(false)
  })

  it('отклоняет объект с лишними ключами (strict)', () => {
    const result = taskInsertSchema.safeParse({
      title: 'Ok',
      extra: 'not allowed',
    })
    expect(result.success).toBe(false)
  })
})

describe('timeEntryInsertSchema', () => {
  it('принимает валидный объект с task_id и started_at', () => {
    const result = timeEntryInsertSchema.safeParse({
      task_id: 1,
      started_at: '2025-01-01T10:00:00.000Z',
    })
    expect(result.success).toBe(true)
  })

  it('отклоняет объект без task_id', () => {
    const result = timeEntryInsertSchema.safeParse({
      started_at: '2025-01-01T10:00:00.000Z',
    })
    expect(result.success).toBe(false)
  })

  it('отклоняет объект без started_at', () => {
    const result = timeEntryInsertSchema.safeParse({
      task_id: 1,
    })
    expect(result.success).toBe(false)
  })

  it('отклоняет объект с некорректным типом task_id', () => {
    const result = timeEntryInsertSchema.safeParse({
      task_id: '1',
      started_at: '2025-01-01T10:00:00.000Z',
    })
    expect(result.success).toBe(false)
  })
})

describe('taskSessionInsertSchema', () => {
  it('принимает валидный объект с task_id и opened_at', () => {
    const result = taskSessionInsertSchema.safeParse({
      task_id: 1,
      opened_at: '2025-01-01T10:00:00.000Z',
    })
    expect(result.success).toBe(true)
  })

  it('отклоняет объект с пустым opened_at', () => {
    const result = taskSessionInsertSchema.safeParse({
      task_id: 1,
      opened_at: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('taskUpdateSchema', () => {
  it('принимает частичное обновление с необязательным title', () => {
    const result = taskUpdateSchema.safeParse({
      title: 'Updated',
    })
    expect(result.success).toBe(true)
  })

  it('принимает пустой title, если он передан', () => {
    const result = taskUpdateSchema.safeParse({ title: '' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('')
    }
  })
})
