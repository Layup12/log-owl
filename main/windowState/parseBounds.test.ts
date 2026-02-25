import { describe, expect, it } from 'vitest'

import {
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
  MIN_HEIGHT,
  MIN_WIDTH,
} from './constants'
import { parseBounds } from './parseBounds'

describe('parseBounds', () => {
  it('returns defaults for null', () => {
    const result = parseBounds(null)
    expect(result).toEqual({
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      x: undefined,
      y: undefined,
    })
  })

  it('returns defaults for empty string', () => {
    const result = parseBounds('')
    expect(result).toEqual({
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      x: undefined,
      y: undefined,
    })
  })

  it('parses valid JSON with width and height', () => {
    const result = parseBounds(JSON.stringify({ width: 1000, height: 600 }))
    expect(result).toEqual({
      width: 1000,
      height: 600,
      x: undefined,
      y: undefined,
    })
  })

  it('parses valid JSON with width, height, x, y', () => {
    const result = parseBounds(
      JSON.stringify({ width: 1000, height: 600, x: 50, y: 100 })
    )
    expect(result).toEqual({
      width: 1000,
      height: 600,
      x: 50,
      y: 100,
    })
  })

  it('clamps width and height to MIN when below', () => {
    const result = parseBounds(JSON.stringify({ width: 100, height: 200 }))
    expect(result).toEqual({
      width: MIN_WIDTH,
      height: MIN_HEIGHT,
      x: undefined,
      y: undefined,
    })
  })

  it('returns defaults for invalid JSON', () => {
    const result = parseBounds('not json')
    expect(result).toEqual({
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      x: undefined,
      y: undefined,
    })
  })

  it('returns defaults when width/height are not numbers', () => {
    const result = parseBounds(JSON.stringify({ width: '1000', height: 600 }))
    expect(result).toEqual({
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      x: undefined,
      y: undefined,
    })
  })

  it('omits x and y when they are not both finite numbers', () => {
    const result = parseBounds(
      JSON.stringify({ width: 1000, height: 600, x: 50 })
    )
    expect(result.x).toBeUndefined()
    expect(result.y).toBeUndefined()
  })
})
