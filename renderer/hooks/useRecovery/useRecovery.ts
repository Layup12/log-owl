import { getRecoveryInfo } from '@renderer/api'
import { useEffect, useState } from 'react'

export function useRecovery() {
  const [recoveryModalOpen, setRecoveryModalOpen] = useState(false)

  useEffect(() => {
    async function fetchRecovery() {
      const info = await getRecoveryInfo()
      if (info?.recovered) setRecoveryModalOpen(true)
    }
    fetchRecovery()
  }, [])

  return {
    recoveryModalOpen,
    closeRecoveryModal: () => setRecoveryModalOpen(false),
  }
}
