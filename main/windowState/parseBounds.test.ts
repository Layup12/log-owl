import { describe, expect, it } from 'vitest'

import {
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
  MIN_HEIGHT,
  MIN_WIDTH,
} from './constants'
import { parseBounds } from './parseBounds'

describe('parseBounds', () => {
  it('возвращает значения по умолчанию для null', () => {
    const result = parseBounds(null)
    expect(result).toEqual({
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      x: undefined,
      y: undefined,
    })
  })

  it('возвращает значения по умолчанию для пустой строки', () => {
    const result = parseBounds('')
    expect(result).toEqual({
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      x: undefined,
      y: undefined,
    })
  })

  it('парсит корректный JSON с width и height', () => {
    const result = parseBounds(JSON.stringify({ width: 1000, height: 600 }))
    expect(result).toEqual({
      width: 1000,
      height: 600,
      x: undefined,
      y: undefined,
    })
  })

  it('парсит корректный JSON с width, height, x и y', () => {
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

  it('ограничивает width и height минимальными значениями, если они меньше минимума', () => {
    const result = parseBounds(JSON.stringify({ width: 100, height: 200 }))
    expect(result).toEqual({
      width: MIN_WIDTH,
      height: MIN_HEIGHT,
      x: undefined,
      y: undefined,
    })
  })

  it('возвращает значения по умолчанию для некорректного JSON', () => {
    const result = parseBounds('not json')
    expect(result).toEqual({
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      x: undefined,
      y: undefined,
    })
  })

  it('возвращает значения по умолчанию, если width/height не числа', () => {
    const result = parseBounds(JSON.stringify({ width: '1000', height: 600 }))
    expect(result).toEqual({
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      x: undefined,
      y: undefined,
    })
  })

  it('игнорирует x и y, если они заданы не обоими конечными числами', () => {
    const result = parseBounds(
      JSON.stringify({ width: 1000, height: 600, x: 50 })
    )
    expect(result.x).toBeUndefined()
    expect(result.y).toBeUndefined()
  })
})
