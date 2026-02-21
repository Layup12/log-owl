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
} from '@renderer/shared/ui'
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Assessment as ReportIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'
import { useThemeStore } from '@renderer/shared/store'
import { ReportModal } from './ReportModal'
import { useLayoutHeader } from '@renderer/hooks'

export function Layout({ children }: { children: React.ReactNode }) {
  const { mode, toggleMode } = useThemeStore()
  const [reportOpen, setReportOpen] = useState(false)
  const location = useLocation()
  const isTaskDetailPage =
    /^\/task\/[^/]+$/.test(location.pathname) &&
    location.pathname !== '/task/new'
  const { title, onBack } = useLayoutHeader()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <AppBar position="static" sx={{ flexShrink: 0 }}>
        <Toolbar>
          {onBack && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={onBack}
              aria-label="Назад"
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </Typography>
          <IconButton
            color="inherit"
            onClick={toggleMode}
            aria-label="toggle theme"
          >
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
      <Box
        component="main"
        sx={{
          flex: '1 1 0',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          p: 2,
        }}
      >
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {children}
        </Box>
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
