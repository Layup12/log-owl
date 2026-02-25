import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material'
import { formatUtcLocal } from '@renderer/shared/lib'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
  Typography,
} from '@renderer/shared/ui'

import type { TaskPageHandlers, TaskPageState } from '../useTaskPage'

interface IntervalsSectionProps {
  state: TaskPageState & TaskPageHandlers
}

export function AddIntervalForm({ state }: IntervalsSectionProps) {
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
          value={state.manualStart}
          onChange={(e) => state.setManualStart(e.target.value)}
          InputProps={{ sx: { minWidth: 220 } }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Конец"
          type="datetime-local"
          value={state.manualEnd}
          onChange={(e) => state.setManualEnd(e.target.value)}
          InputProps={{ sx: { minWidth: 220 } }}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="outlined" onClick={state.handleAddInterval}>
          Добавить
        </Button>
      </Box>
      {state.manualError && (
        <Alert severity="error" sx={{ mt: 1 }} onClose={state.clearManualError}>
          {state.manualError}
        </Alert>
      )}
    </>
  )
}

export function IntervalsList({ state }: IntervalsSectionProps) {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mb: 0.5, flexShrink: 0 }}
        >
          Всего: {state.intervalsTotalMinutes} мин
        </Typography>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          gutterBottom
          sx={{ flexShrink: 0 }}
        >
          Интервалы
        </Typography>
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <List
            dense
            component="div"
            sx={{ bgcolor: 'action.hover', borderRadius: 1 }}
          >
            {state.timeEntries.length === 0 ? (
              <ListItem>
                <ListItemText primary="Нет интервалов" />
              </ListItem>
            ) : (
              [...state.timeEntries]
                .sort(
                  (a, b) =>
                    new Date(b.started_at).getTime() -
                    new Date(a.started_at).getTime()
                )
                .map((entry) =>
                  state.editingEntryId === entry.id ? (
                    <ListItem key={entry.id} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      <TextField
                        size="small"
                        label="Начало"
                        type="datetime-local"
                        value={state.editStart}
                        onChange={(e) => state.setEditStart(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 200 }}
                      />
                      <TextField
                        size="small"
                        label="Конец"
                        type="datetime-local"
                        value={state.editEnd}
                        onChange={(e) => state.setEditEnd(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 200 }}
                      />
                      <IconButton
                        size="small"
                        onClick={state.saveEditEntry}
                        aria-label="Сохранить"
                      >
                        <SaveIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={state.cancelEditEntry}
                        aria-label="Отмена"
                      >
                        <CloseIcon />
                      </IconButton>
                    </ListItem>
                  ) : (
                    <ListItem key={entry.id}>
                      <ListItemText
                        primary={`${formatUtcLocal(entry.started_at)} — ${entry.ended_at ? formatUtcLocal(entry.ended_at) : '…'}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          onClick={() => state.startEditEntry(entry)}
                          aria-label="Редактировать"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => state.openDeleteEntryDialog(entry)}
                          aria-label="Удалить"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  )
                )
            )}
          </List>
        </Box>
      </Box>

      <Dialog
        open={state.deleteConfirmEntry !== null}
        onClose={state.closeDeleteEntryDialog}
      >
        <DialogTitle>Удалить интервал?</DialogTitle>
        <DialogContent>
          {state.deleteConfirmEntry && (
            <Typography>
              {formatUtcLocal(state.deleteConfirmEntry.started_at)} —{' '}
              {state.deleteConfirmEntry.ended_at
                ? formatUtcLocal(state.deleteConfirmEntry.ended_at)
                : '…'}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={state.closeDeleteEntryDialog}>Отмена</Button>
          <Button
            color="error"
            variant="contained"
            onClick={state.handleDeleteEntry}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
