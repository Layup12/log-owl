import { Alert, Box, Button, TextField, Typography } from '@renderer/shared/ui'

import type { TaskPageFormValues } from '../hooks'

export interface AddIntervalFormProps {
  manualStart: string
  manualEnd: string
  setFormField: <K extends keyof TaskPageFormValues>(
    name: K,
    value: TaskPageFormValues[K]
  ) => void
  onAddInterval: () => Promise<void>
  manualError: string | null
  onClearManualError: () => void
}

export function AddIntervalForm({
  manualStart,
  manualEnd,
  setFormField,
  onAddInterval,
  manualError,
  onClearManualError,
}: AddIntervalFormProps) {
  return (
    <>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Добавить интервал
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'flex-start',
        }}
      >
        <TextField
          label="Начало"
          type="datetime-local"
          value={manualStart}
          onChange={(e) => setFormField('manualStart', e.target.value)}
          InputProps={{ sx: { minWidth: 220 } }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Конец"
          type="datetime-local"
          value={manualEnd}
          onChange={(e) => setFormField('manualEnd', e.target.value)}
          InputProps={{ sx: { minWidth: 220 } }}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="outlined" onClick={onAddInterval}>
          Добавить
        </Button>
      </Box>
      {manualError && (
        <Alert severity="error" sx={{ mt: 1 }} onClose={onClearManualError}>
          {manualError}
        </Alert>
      )}
    </>
  )
}
