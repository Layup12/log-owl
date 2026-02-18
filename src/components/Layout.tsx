import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  AppBar,
  Box,
  Fab,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { DarkMode as DarkModeIcon, LightMode as LightModeIcon, Assessment as ReportIcon } from '@mui/icons-material'
import { useThemeStore } from '../store/themeStore'
import { ReportModal } from './ReportModal'

export function Layout({ children }: { children: React.ReactNode }) {
  const { mode, toggleMode } = useThemeStore()
  const [reportOpen, setReportOpen] = useState(false)
  const location = useLocation()
  const isTaskDetailPage = /^\/task\/[^/]+$/.test(location.pathname) && location.pathname !== '/task/new'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Log Owl
          </Typography>
          <IconButton color="inherit" onClick={toggleMode} aria-label="toggle theme">
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
      <Box component="main" sx={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column', p: 2 }}>
        {children}
      </Box>
      {!isTaskDetailPage && (
        <Tooltip title="Отчёт">
          <Fab
            color="primary"
            aria-label="Отчёт"
            onClick={() => setReportOpen(true)}
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
          >
            <ReportIcon />
          </Fab>
        </Tooltip>
      )}
    </Box>
  )
}

