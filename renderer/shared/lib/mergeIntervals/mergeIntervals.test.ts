import { describe, expect, it } from 'vitest'

import {
  clipIntervalsToRange,
  type Interval,
  mergeIntervals,
  totalMinutesRoundedUp,
} from './mergeIntervals'

describe('mergeIntervals', () => {
  it('returns empty array for empty input', () => {
    expect(mergeIntervals([])).toEqual([])
  })

  it('ignores intervals with null end', () => {
    expect(
      mergeIntervals([{ start: '2025-01-01T10:00:00.000Z', end: null }])
    ).toEqual([])
  })

  it('returns single interval as-is', () => {
    const one: Interval[] = [
      { start: '2025-01-01T10:00:00.000Z', end: '2025-01-01T11:00:00.000Z' },
    ]
    expect(mergeIntervals(one)).toEqual([
      { start: '2025-01-01T10:00:00.000Z', end: '2025-01-01T11:00:00.000Z' },
    ])
  })

  it('sorts by start then merges overlapping', () => {
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

  it('merges adjacent intervals (end equals next start)', () => {
    const intervals: Interval[] = [
      { start: '2025-01-01T10:00:00.000Z', end: '2025-01-01T11:00:00.000Z' },
      { start: '2025-01-01T11:00:00.000Z', end: '2025-01-01T12:00:00.000Z' },
    ]
    expect(mergeIntervals(intervals)).toEqual([
      { start: '2025-01-01T10:00:00.000Z', end: '2025-01-01T12:00:00.000Z' },
    ])
  })

  it('merges fully contained interval', () => {
    const intervals: Interval[] = [
      { start: '2025-01-01T10:00:00.000Z', end: '2025-01-01T13:00:00.000Z' },
      { start: '2025-01-01T11:00:00.000Z', end: '2025-01-01T12:00:00.000Z' },
    ]
    expect(mergeIntervals(intervals)).toEqual([
      { start: '2025-01-01T10:00:00.000Z', end: '2025-01-01T13:00:00.000Z' },
    ])
  })

  it('does not mutate input', () => {
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

  it('returns empty array for empty input', () => {
    expect(clipIntervalsToRange([], fromIso, toIso)).toEqual([])
  })

  it('returns interval unchanged when fully inside range', () => {
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

  it('clips interval when start is before from', () => {
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

  it('clips interval when end is after to', () => {
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

  it('returns no segment when interval is fully before range', () => {
    const intervals: Interval[] = [
      {
        start: '2025-01-01T08:00:00.000Z',
        end: '2025-01-01T09:00:00.000Z',
      },
    ]
    expect(clipIntervalsToRange(intervals, fromIso, toIso)).toEqual([])
  })

  it('returns no segment when interval is fully after range', () => {
    const intervals: Interval[] = [
      {
        start: '2025-01-01T13:00:00.000Z',
        end: '2025-01-01T14:00:00.000Z',
      },
    ]
    expect(clipIntervalsToRange(intervals, fromIso, toIso)).toEqual([])
  })

  it('clips open interval (end null) with end = toIso', () => {
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

  it('omits zero-length segments', () => {
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
  it('returns 0 for no closed intervals', () => {
    expect(totalMinutesRoundedUp([])).toBe(0)
    expect(
      totalMinutesRoundedUp([{ start: '2025-01-01T10:00:00.000Z', end: null }])
    ).toBe(0)
  })

  it('returns rounded up minutes for one interval', () => {
    const intervals: Interval[] = [
      { start: '2025-01-01T10:00:00.000Z', end: '2025-01-01T10:00:30.000Z' }, // 0.5 min
    ]
    expect(totalMinutesRoundedUp(intervals)).toBe(1)
  })

  it('returns sum of merged intervals (overlap counted once)', () => {
    const intervals: Interval[] = [
      { start: '2025-01-01T10:00:00.000Z', end: '2025-01-01T11:00:00.000Z' }, // 60 min
      { start: '2025-01-01T10:30:00.000Z', end: '2025-01-01T11:00:00.000Z' }, // 30 min overlap
    ]
    expect(totalMinutesRoundedUp(intervals)).toBe(60)
  })

  it('rounds up partial minutes', () => {
    const intervals: Interval[] = [
      { start: '2025-01-01T10:00:00.000Z', end: '2025-01-01T10:01:01.000Z' }, // 1 min 1 sec
    ]
    expect(totalMinutesRoundedUp(intervals)).toBe(2)
  })
})
