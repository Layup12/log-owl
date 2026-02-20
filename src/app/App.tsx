import { AppProviders } from './providers'
import { AppRoutes } from './routes'
import { Layout } from '../components/Layout'
import { RecoveryModal } from '../components/RecoveryModal'
import { useRecovery } from '@hooks'
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
