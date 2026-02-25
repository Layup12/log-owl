import { getRecoveryInfo, type RecoveryInfo } from '@renderer/api'
import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useRecovery } from './useRecovery'

vi.mock('@renderer/api', () => ({
  getRecoveryInfo: vi.fn(),
}))

const getRecoveryInfoMock = vi.mocked(getRecoveryInfo)

describe('useRecovery', () => {
  it('изначально модалка закрыта', async () => {
    const info: RecoveryInfo = { recovered: false, closedIds: [] }
    getRecoveryInfoMock.mockResolvedValueOnce(info)

    const { result } = renderHook(() => useRecovery())

    expect(result.current.recoveryModalOpen).toBe(false)

    await waitFor(() => {
      expect(result.current.recoveryModalOpen).toBe(false)
    })
  })

  it('открывает модалку при recovered=true', async () => {
    const info: RecoveryInfo = { recovered: true, closedIds: [1, 2] }
    getRecoveryInfoMock.mockResolvedValueOnce(info)

    const { result } = renderHook(() => useRecovery())

    expect(result.current.recoveryModalOpen).toBe(false)

    await waitFor(() => {
      expect(result.current.recoveryModalOpen).toBe(true)
    })
  })

  it('не открывает модалку при recovered=false', async () => {
    const info: RecoveryInfo = { recovered: false, closedIds: [] }
    getRecoveryInfoMock.mockResolvedValueOnce(info)

    const { result } = renderHook(() => useRecovery())

    expect(result.current.recoveryModalOpen).toBe(false)

    await waitFor(() => {
      expect(result.current.recoveryModalOpen).toBe(false)
    })
  })

  it('оставляет модалку закрытой при пустом ответе', async () => {
    getRecoveryInfoMock.mockResolvedValueOnce(null as unknown as RecoveryInfo)

    const { result } = renderHook(() => useRecovery())

    expect(result.current.recoveryModalOpen).toBe(false)

    await waitFor(() => {
      expect(result.current.recoveryModalOpen).toBe(false)
    })
  })

  it('не делает лишних вызовов getRecoveryInfo при повторном рендере', () => {
    const info: RecoveryInfo = { recovered: false, closedIds: [] }
    getRecoveryInfoMock.mockResolvedValue(info)

    getRecoveryInfoMock.mockClear()

    const { rerender } = renderHook(() => useRecovery())

    const callsAfterFirstRender = getRecoveryInfoMock.mock.calls.length

    rerender()

    expect(getRecoveryInfoMock).toHaveBeenCalledTimes(callsAfterFirstRender)
  })

  it('закрывает модалку через closeRecoveryModal', async () => {
    const info: RecoveryInfo = { recovered: true, closedIds: [] }
    getRecoveryInfoMock.mockResolvedValueOnce(info)

    const { result } = renderHook(() => useRecovery())

    await waitFor(() => {
      expect(result.current.recoveryModalOpen).toBe(true)
    })

    act(() => {
      result.current.closeRecoveryModal()
    })

    expect(result.current.recoveryModalOpen).toBe(false)
  })
})
