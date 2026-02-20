import { useEffect, useState } from 'react'
import { getRecoveryInfo } from '@api'

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
