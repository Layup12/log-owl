import { describe, expect, it } from 'vitest'

import {
  clipIntervalsToRange,
  type Interval,
  mergeIntervals,
  totalMinutesRoundedUp,
} from './mergeIntervals'

describe('mergeIntervals', () => {
  it('возвращает пустой массив для пустого ввода', () => {
    expect(mergeIntervals([])).toEqual([])
  })

  it('игнорирует интервалы с end = null', () => {
    expect(
      mergeIntervals([{ start: '2025-01-01T10:00:00.000Z', end: null }])
    ).toEqual([])
  })

  it('возвращает один интервал без изменений', () => {
    const one: Interval[] = [
      { start: '2025-01-01T10:00:00.000Z', end: '2025-01-01T11:00:00.000Z' },
    ]
    expect(mergeIntervals(one)).toEqual([
      { start: '2025-01-01T10:00:00.000Z', end: '2025-01-01T11:00:00.000Z' },
    ])
  })

  it('сортирует по start и затем объединяет пересекающиеся интервалы', () => {
    const intervals: Interval[] = [
      { start: '2025-01-01T12:00:00.000Z', end: '2025-01-01T13:00:00.000Z' },
      { start: '2025-01-01T10:00:00.000Z', end: '2025-01-01T11:00:00.000Z' },
      { start: '2025-01-01T10:30:00.000Z', end: '2025-01-01T11:30:00.000Z' },
    ]
    expect(mergeIntervals(intervals)).toEqual([
      { start: '2025-01-01T10:00:00.000Z', end: '2025-01-01T11:30:00.000Z' },
      { start: '2025-01-01T12:00:00.000Z', end: '2025-01-01T13:00:00.000Z' },
    ])
  })

  it('объединяет соседние интервалы (end равен следующему start)', () => {
    const intervals: Interval[] = [
      { start: '2025-01-01T10:00:00.000Z', end: '2025-01-01T11:00:00.000Z' },
      { start: '2025-01-01T11:00:00.000Z', end: '2025-01-01T12:00:00.000Z' },
    ]
    expect(mergeIntervals(intervals)).toEqual([
      { start: '2025-01-01T10:00:00.000Z', end: '2025-01-01T12:00:00.000Z' },
    ])
  })

  it('объединяет полностью вложенный интервал', () => {
    const intervals: Interval[] = [
      { start: '2025-01-01T10:00:00.000Z', end: '2025-01-01T13:00:00.000Z' },
      { start: '2025-01-01T11:00:00.000Z', end: '2025-01-01T12:00:00.000Z' },
    ]
    expect(mergeIntervals(intervals)).toEqual([
      { start: '2025-01-01T10:00:00.000Z', end: '2025-01-01T13:00:00.000Z' },
    ])
  })

  it('не мутирует входной массив', () => {
    const intervals: Interval[] = [
      { start: '2025-01-01T12:00:00.000Z', end: '2025-01-01T13:00:00.000Z' },
      { start: '2025-01-01T10:00:00.000Z', end: '2025-01-01T11:00:00.000Z' },
    ]
    const copy = intervals.map((i) => ({ ...i }))
    mergeIntervals(intervals)
    expect(intervals).toEqual(copy)
  })
})

describe('clipIntervalsToRange', () => {
  const fromIso = '2025-01-01T10:00:00.000Z'
  const toIso = '2025-01-01T12:00:00.000Z'

  it('возвращает пустой массив для пустого ввода', () => {
    expect(clipIntervalsToRange([], fromIso, toIso)).toEqual([])
  })

  it('возвращает интервал без изменений, если он полностью внутри диапазона', () => {
    const intervals: Interval[] = [
      {
        start: '2025-01-01T10:30:00.000Z',
        end: '2025-01-01T11:30:00.000Z',
      },
    ]
    expect(clipIntervalsToRange(intervals, fromIso, toIso)).toEqual([
      {
        start: '2025-01-01T10:30:00.000Z',
        end: '2025-01-01T11:30:00.000Z',
      },
    ])
  })

  it('обрезает интервал, если start раньше from', () => {
    const intervals: Interval[] = [
      {
        start: '2025-01-01T09:00:00.000Z',
        end: '2025-01-01T11:00:00.000Z',
      },
    ]
    expect(clipIntervalsToRange(intervals, fromIso, toIso)).toEqual([
      {
        start: '2025-01-01T10:00:00.000Z',
        end: '2025-01-01T11:00:00.000Z',
      },
    ])
  })

  it('обрезает интервал, если end позже to', () => {
    const intervals: Interval[] = [
      {
        start: '2025-01-01T11:00:00.000Z',
        end: '2025-01-01T13:00:00.000Z',
      },
    ]
    expect(clipIntervalsToRange(intervals, fromIso, toIso)).toEqual([
      {
        start: '2025-01-01T11:00:00.000Z',
        end: '2025-01-01T12:00:00.000Z',
      },
    ])
  })

  it('не возвращает интервал, если он полностью до диапазона', () => {
    const intervals: Interval[] = [
      {
        start: '2025-01-01T08:00:00.000Z',
        end: '2025-01-01T09:00:00.000Z',
      },
    ]
    expect(clipIntervalsToRange(intervals, fromIso, toIso)).toEqual([])
  })

  it('не возвращает интервал, если он полностью после диапазона', () => {
    const intervals: Interval[] = [
      {
        start: '2025-01-01T13:00:00.000Z',
        end: '2025-01-01T14:00:00.000Z',
      },
    ]
    expect(clipIntervalsToRange(intervals, fromIso, toIso)).toEqual([])
  })

  it('обрезает открытый интервал (end = null), устанавливая end = toIso', () => {
    const intervals: Interval[] = [
      {
        start: '2025-01-01T11:00:00.000Z',
        end: null,
      },
    ]
    expect(clipIntervalsToRange(intervals, fromIso, toIso)).toEqual([
      {
        start: '2025-01-01T11:00:00.000Z',
        end: '2025-01-01T12:00:00.000Z',
      },
    ])
  })

  it('пропускает интервалы нулевой длины', () => {
    const intervals: Interval[] = [
      {
        start: '2025-01-01T09:00:00.000Z',
        end: '2025-01-01T10:00:00.000Z',
      },
    ]
    expect(clipIntervalsToRange(intervals, fromIso, toIso)).toEqual([])
  })
})

describe('totalMinutesRoundedUp', () => {
  it('возвращает 0, если нет закрытых интервалов', () => {
    expect(totalMinutesRoundedUp([])).toBe(0)
    expect(
      totalMinutesRoundedUp([{ start: '2025-01-01T10:00:00.000Z', end: null }])
    ).toBe(0)
  })

  it('возвращает округлённые вверх минуты для одного интервала', () => {
    const intervals: Interval[] = [
      { start: '2025-01-01T10:00:00.000Z', end: '2025-01-01T10:00:30.000Z' }, // 0.5 min
    ]
    expect(totalMinutesRoundedUp(intervals)).toBe(1)
  })

  it('возвращает сумму минут объединённых интервалов (пересечения считаются один раз)', () => {
    const intervals: Interval[] = [
      { start: '2025-01-01T10:00:00.000Z', end: '2025-01-01T11:00:00.000Z' }, // 60 min
      { start: '2025-01-01T10:30:00.000Z', end: '2025-01-01T11:00:00.000Z' }, // 30 min overlap
    ]
    expect(totalMinutesRoundedUp(intervals)).toBe(60)
  })

  it('округляет неполные минуты вверх', () => {
    const intervals: Interval[] = [
      { start: '2025-01-01T10:00:00.000Z', end: '2025-01-01T10:01:01.000Z' }, // 1 min 1 sec
    ]
    expect(totalMinutesRoundedUp(intervals)).toBe(2)
  })
})
