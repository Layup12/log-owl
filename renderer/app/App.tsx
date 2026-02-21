import { AppProviders } from './providers'
import { AppRoutes } from './routes'
import { Layout, RecoveryModal } from '@renderer/components'
import { useRecovery } from '@renderer/hooks'
import { LayoutProvider } from './providers'

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
