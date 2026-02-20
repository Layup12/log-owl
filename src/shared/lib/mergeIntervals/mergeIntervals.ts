/**
 * Interval with start and end as ISO UTC strings.
 * For merge/total only intervals with both start and end are used.
 */
export interface Interval {
  start: string
  end: string | null
}

/**
 * Merged interval (always has end).
 */
export interface MergedInterval {
  start: string
  end: string
}

/**
 * Sorts by start, then merges overlapping or adjacent intervals.
 * Only intervals with non-null end are considered; others are skipped.
 * Pure function: does not mutate input.
 */
export function mergeIntervals(intervals: Interval[]): MergedInterval[] {
  const closed = intervals.filter(
    (i): i is Interval & { end: string } => i.end !== null && i.end !== undefined
  )
  if (closed.length === 0) return []
  const sorted = [...closed].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  )
  const result: MergedInterval[] = [{ start: sorted[0].start, end: sorted[0].end }]
  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i]
    const last = result[result.length - 1]
    const lastEndMs = new Date(last.end).getTime()
    const currStartMs = new Date(curr.start).getTime()
    if (currStartMs <= lastEndMs) {
      const currEndMs = new Date(curr.end).getTime()
      last.end = new Date(Math.max(lastEndMs, currEndMs)).toISOString()
    } else {
      result.push({ start: curr.start, end: curr.end })
    }
  }
  return result
}

/**
 * Total duration of intervals in minutes, rounded up.
 * Uses mergeIntervals so overlapping time is counted once.
 */
export function totalMinutesRoundedUp(intervals: Interval[]): number {
  const merged = mergeIntervals(intervals)
  let totalMs = 0
  for (const m of merged) {
    totalMs += new Date(m.end).getTime() - new Date(m.start).getTime()
  }
  const totalMinutes = totalMs / (60 * 1000)
  return Math.ceil(totalMinutes)
}

/**
 * Clips intervals to [fromIso, toIso]. Open intervals (end null) are clipped with end = toIso.
 * Returns closed intervals only; zero-length segments are omitted.
 */
export function clipIntervalsToRange(
  intervals: Interval[],
  fromIso: string,
  toIso: string
): Interval[] {
  const fromMs = new Date(fromIso).getTime()
  const toMs = new Date(toIso).getTime()
  const result: Interval[] = []
  for (const i of intervals) {
    const startMs = new Date(i.start).getTime()
    const endMs = i.end ? new Date(i.end).getTime() : toMs
    const clipStart = Math.max(startMs, fromMs)
    const clipEnd = Math.min(endMs, toMs)
    if (clipStart < clipEnd) {
      result.push({
        start: new Date(clipStart).toISOString(),
        end: new Date(clipEnd).toISOString(),
      })
    }
  }
  return result
}

