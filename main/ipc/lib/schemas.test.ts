import { describe, expect, it } from 'vitest'

import {
  taskInsertSchema,
  taskSessionInsertSchema,
  taskUpdateSchema,
  timeEntryInsertSchema,
} from './schemas'

describe('taskInsertSchema', () => {
  it('accepts valid object with title', () => {
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

  it('accepts object with comment and completed_at', () => {
    const result = taskInsertSchema.safeParse({
      title: 'Done task',
      comment: 'Note',
      completed_at: '2025-01-01T12:00:00.000Z',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty title', () => {
    const result = taskInsertSchema.safeParse({ title: '' })
    expect(result.success).toBe(false)
  })

  it('rejects when title is not a string', () => {
    const result = taskInsertSchema.safeParse({ title: 123 })
    expect(result.success).toBe(false)
  })

  it('rejects extra keys (strict)', () => {
    const result = taskInsertSchema.safeParse({
      title: 'Ok',
      extra: 'not allowed',
    })
    expect(result.success).toBe(false)
  })
})

describe('timeEntryInsertSchema', () => {
  it('accepts valid object with task_id and started_at', () => {
    const result = timeEntryInsertSchema.safeParse({
      task_id: 1,
      started_at: '2025-01-01T10:00:00.000Z',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing task_id', () => {
    const result = timeEntryInsertSchema.safeParse({
      started_at: '2025-01-01T10:00:00.000Z',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing started_at', () => {
    const result = timeEntryInsertSchema.safeParse({
      task_id: 1,
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid task_id type', () => {
    const result = timeEntryInsertSchema.safeParse({
      task_id: '1',
      started_at: '2025-01-01T10:00:00.000Z',
    })
    expect(result.success).toBe(false)
  })
})

describe('taskSessionInsertSchema', () => {
  it('accepts valid object with task_id and opened_at', () => {
    const result = taskSessionInsertSchema.safeParse({
      task_id: 1,
      opened_at: '2025-01-01T10:00:00.000Z',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty opened_at', () => {
    const result = taskSessionInsertSchema.safeParse({
      task_id: 1,
      opened_at: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('taskUpdateSchema', () => {
  it('accepts partial update with optional title', () => {
    const result = taskUpdateSchema.safeParse({
      title: 'Updated',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty title when provided', () => {
    const result = taskUpdateSchema.safeParse({ title: '' })
    expect(result.success).toBe(false)
  })
})
