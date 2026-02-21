import { z } from 'zod'

// Примитивы
export const idSchema = z.number().int().positive()
export const keySchema = z.string().min(1, 'key is required')
export const valueSchema = z.string()
export const isoStringSchema = z.string().min(1, 'ISO string is required')

// Task
export const taskInsertSchema = z
  .object({
    title: z.string().min(1, 'title is required'),
    comment: z.string().nullable().optional(),
    completed_at: z.string().nullable().optional(),
  })
  .strict()

export const taskUpdateSchema = z
  .object({
    title: z.string().min(1).optional(),
    comment: z.string().nullable().optional(),
    completed_at: z.string().nullable().optional(),
  })
  .strict()

// TimeEntry
export const timeEntryInsertSchema = z
  .object({
    task_id: z.number().int().positive(),
    started_at: z.string().min(1, 'started_at is required'),
    ended_at: z.string().nullable().optional(),
    source: z.string().nullable().optional(),
  })
  .strict()

export const timeEntryUpdateSchema = z
  .object({
    task_id: z.number().int().positive().optional(),
    started_at: z.string().min(1).optional(),
    ended_at: z.string().nullable().optional(),
    source: z.string().nullable().optional(),
  })
  .strict()

// TaskSession
export const taskSessionInsertSchema = z
  .object({
    task_id: z.number().int().positive(),
    opened_at: z.string().min(1, 'opened_at is required'),
    closed_at: z.string().nullable().optional(),
    last_seen: z.string().nullable().optional(),
  })
  .strict()

export const taskSessionUpdateSchema = z
  .object({
    task_id: z.number().int().positive().optional(),
    opened_at: z.string().min(1).optional(),
    closed_at: z.string().nullable().optional(),
    last_seen: z.string().nullable().optional(),
  })
  .strict()
