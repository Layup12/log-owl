import {
  ArrowBack as ArrowBackIcon,
  Assessment as ReportIcon,
  DarkMode as DarkModeIcon,
  Home as HomeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material'
import { useLayoutHeader } from '@renderer/hooks'
import { useThemeStore } from '@renderer/shared/store'
import {
  AppBar,
  Box,
  Fab,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@renderer/shared/ui'
import React, { useState } from 'react'

import { ReportModal } from '../ReportModal'
import { TaskTray } from '../TaskTray'

export function Layout({ children }: { children: React.ReactNode }) {
  const { mode, toggleMode } = useThemeStore()
  const [reportOpen, setReportOpen] = useState(false)
  const { title, onBack, onHome, showReportFab } = useLayoutHeader()

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
        <Toolbar sx={{ minWidth: 0, display: 'flex', gap: 2 }}>
          <Box
            sx={{
              flex: '1 1 0',
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: '50%',
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {onBack && (
                <IconButton
                  color="inherit"
                  edge="start"
                  onClick={onBack}
                  aria-label="Назад"
                  sx={{ flexShrink: 0 }}
                >
                  <ArrowBackIcon />
                </IconButton>
              )}
              {onHome && (
                <IconButton
                  color="inherit"
                  onClick={onHome}
                  aria-label="На главную"
                  sx={{ flexShrink: 0 }}
                >
                  <HomeIcon />
                </IconButton>
              )}
              <Typography
                variant="h6"
                component="div"
                sx={{
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {title}
              </Typography>
            </Box>
            <Box
              sx={{
                width: '50%',
                maxWidth: 400,
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <TaskTray />
            </Box>
          </Box>
          <IconButton
            color="inherit"
            onClick={toggleMode}
            aria-label="toggle theme"
            sx={{ flexShrink: 0, width: 48 }}
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
      {showReportFab && (
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
