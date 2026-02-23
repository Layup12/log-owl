import { Layout, RecoveryModal } from '@renderer/components'
import { useRecovery } from '@renderer/hooks'

import { AppProviders } from './providers'
import { LayoutProvider } from './providers'
import { AppRoutes } from './routes'

export function App() {
  const { recoveryModalOpen, closeRecoveryModal } = useRecovery()

  return (
    <AppProviders>
      <LayoutProvider>
        <Layout>
          <AppRoutes />
        </Layout>
      </LayoutProvider>
      <RecoveryModal open={recoveryModalOpen} onClose={closeRecoveryModal} />
    </AppProviders>
  )
}
