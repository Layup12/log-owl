import { Alert, Box, Button, CircularProgress } from '@renderer/shared/ui'

import { useNewTaskPage } from './useNewTaskPage'

export function NewTaskPage() {
  const { error, clearError, goToList } = useNewTaskPage()

  if (error) {
    return (
      <Box sx={{ maxWidth: 640 }}>
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
        <Button onClick={goToList}>К списку</Button>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
      <CircularProgress />
    </Box>
  )
}
