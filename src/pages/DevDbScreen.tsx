import React, { useState } from 'react'
import { Box, Button, Paper, Typography } from '@mui/material'

export function DevDbScreen() {
  const [tasksJson, setTasksJson] = useState<string>('')

  const handleCreateTask = async () => {
    await window.electron.invoke('task:create', { title: 'Test task ' + Date.now() })
    setTasksJson('Created. Click "List tasks" to refresh.')
  }

  const handleListTasks = async () => {
    const tasks = await window.electron.invoke('task:getAll')
    setTasksJson(JSON.stringify(tasks, null, 2))
  }

  return (
    <Box sx={{ maxWidth: 720 }}>
      <Typography variant="h6" gutterBottom>
        Dev: DB check
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="contained" onClick={handleCreateTask}>
          Create task
        </Button>
        <Button variant="outlined" onClick={handleListTasks}>
          List tasks
        </Button>
      </Box>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
          {tasksJson || '—'}
        </Typography>
      </Paper>
    </Box>
  )
}
