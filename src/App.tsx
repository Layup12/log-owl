import React, { useEffect, useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider, CssBaseline, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'
import { useThemeStore } from './store/themeStore'
import { getTheme } from './theme'
import { Layout } from './components/Layout'
import { TaskListScreen } from './pages/TaskListScreen'
import { TaskPage } from './pages/TaskPage'
import { NewTaskPage } from './pages/NewTaskPage'

function App() {
  const mode = useThemeStore((state) => state.mode)
  const theme = React.useMemo(() => getTheme(mode), [mode])
  const [recoveryModalOpen, setRecoveryModalOpen] = useState(false)

  useEffect(() => {
    window.electron.invoke('app:getRecoveryInfo').then((res) => {
      const info = res as { recovered: boolean; closedIds: number[] }
      if (info?.recovered) setRecoveryModalOpen(true)
    })
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<TaskListScreen />} />
            <Route path="/task/new" element={<NewTaskPage />} />
            <Route path="/task/:id" element={<TaskPage />} />
          </Routes>
        </Layout>
      </HashRouter>
      <Dialog open={recoveryModalOpen} onClose={() => setRecoveryModalOpen(false)}>
        <DialogTitle>Восстановление</DialogTitle>
        <DialogContent>
          Незавершённые интервалы закрыты по last_seen.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecoveryModalOpen(false)}>OK</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  )
}

export default App
