import { getRecoveryInfo } from '@renderer/api'
import { useEffect, useState } from 'react'

export function useRecovery() {
  const [recoveryModalOpen, setRecoveryModalOpen] = useState(false)

  useEffect(() => {
    getRecoveryInfo().then((info) => {
      if (info?.recovered) setRecoveryModalOpen(true)
    })
  }, [])

  return {
    recoveryModalOpen,
    closeRecoveryModal: () => setRecoveryModalOpen(false),
  }
}
