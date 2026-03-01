import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useDeleteTaskDialog } from './useDeleteTaskDialog'

describe('useDeleteTaskDialog', () => {
  it('изначально диалог закрыт, taskId null', () => {
    const { result } = renderHook(() => useDeleteTaskDialog())

    expect(result.current.isOpen).toBe(false)
    expect(result.current.taskId).toBeNull()
  })

  it('open(taskId) открывает диалог и запоминает taskId', () => {
    const { result } = renderHook(() => useDeleteTaskDialog())

    act(() => {
      result.current.open(42)
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.taskId).toBe(42)
  })

  it('close() закрывает диалог и сбрасывает taskId', () => {
    const { result } = renderHook(() => useDeleteTaskDialog())

    act(() => {
      result.current.open(10)
    })
    expect(result.current.isOpen).toBe(true)

    act(() => {
      result.current.close()
    })

    expect(result.current.isOpen).toBe(false)
    expect(result.current.taskId).toBeNull()
  })

  it('open вызывается с другим taskId — обновляет taskId', () => {
    const { result } = renderHook(() => useDeleteTaskDialog())

    act(() => {
      result.current.open(1)
    })
    expect(result.current.taskId).toBe(1)

    act(() => {
      result.current.open(2)
    })
    expect(result.current.isOpen).toBe(true)
    expect(result.current.taskId).toBe(2)
  })
})
