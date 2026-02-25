import {
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
  MIN_HEIGHT,
  MIN_WIDTH,
} from './constants'

interface ParsedBounds {
  width: number
  height: number
  x?: number
  y?: number
}

export function parseBounds(boundsStr: string | null): ParsedBounds {
  let width = DEFAULT_WIDTH
  let height = DEFAULT_HEIGHT
  let x: number | undefined
  let y: number | undefined
  if (!boundsStr) return { width, height, x, y }
  try {
    const b = JSON.parse(boundsStr) as {
      width?: number
      height?: number
      x?: number
      y?: number
    }
    const w = b.width
    const h = b.height
    if (
      typeof w === 'number' &&
      Number.isFinite(w) &&
      typeof h === 'number' &&
      Number.isFinite(h)
    ) {
      width = Math.max(MIN_WIDTH, w)
      height = Math.max(MIN_HEIGHT, h)
      if (
        typeof b.x === 'number' &&
        Number.isFinite(b.x) &&
        typeof b.y === 'number' &&
        Number.isFinite(b.y)
      ) {
        x = b.x
        y = b.y
      }
    }
  } catch {
    // ignore
  }
  return { width, height, x, y }
}
