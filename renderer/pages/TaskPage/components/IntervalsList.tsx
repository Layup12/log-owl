import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material'
import { formatUtcLocal } from '@renderer/shared/lib'
import type { TimeEntry } from '@renderer/shared/types'
import {
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

import type { TaskPageFormValues } from '../hooks'

export interface IntervalsListProps {
  intervalsTotalMinutes: number
  timeEntries: TimeEntry[]
  editingEntryId: number | null
  editStart: string
  editEnd: string
  setFormField: <K extends keyof TaskPageFormValues>(
    name: K,
    value: TaskPageFormValues[K]
  ) => void
  onSaveEditEntry: () => Promise<void>
  onCancelEditEntry: () => void
  onStartEditEntry: (entry: TimeEntry) => void
  onOpenDeleteEntryDialog: (entry: TimeEntry) => void
  onCloseDeleteEntryDialog: () => void
  deleteConfirmEntry: TimeEntry | null
  onDeleteEntry: () => Promise<void>
}

export function IntervalsList({
  intervals,
}: {
  intervals: IntervalsListProps
}) {
  const {
    intervalsTotalMinutes,
    timeEntries,
    editingEntryId,
    editStart,
    editEnd,
    setFormField,
    onSaveEditEntry,
    onCancelEditEntry,
    onStartEditEntry,
    onOpenDeleteEntryDialog,
    onCloseDeleteEntryDialog,
    deleteConfirmEntry,
    onDeleteEntry,
  } = intervals

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
          Всего: {intervalsTotalMinutes} мин
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
            {timeEntries.length === 0 ? (
              <ListItem>
                <ListItemText primary="Нет интервалов" />
              </ListItem>
            ) : (
              [...timeEntries]
                .sort(
                  (a, b) =>
                    new Date(b.started_at).getTime() -
                    new Date(a.started_at).getTime()
                )
                .map((entry) =>
                  editingEntryId === entry.id ? (
                    <ListItem key={entry.id} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      <TextField
                        size="small"
                        label="Начало"
                        type="datetime-local"
                        value={editStart}
                        onChange={(e) =>
                          setFormField('editStart', e.target.value)
                        }
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 200 }}
                      />
                      <TextField
                        size="small"
                        label="Конец"
                        type="datetime-local"
                        value={editEnd}
                        onChange={(e) =>
                          setFormField('editEnd', e.target.value)
                        }
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 200 }}
                      />
                      <IconButton
                        size="small"
                        onClick={onSaveEditEntry}
                        aria-label="Сохранить"
                      >
                        <SaveIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={onCancelEditEntry}
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
                          onClick={() => onStartEditEntry(entry)}
                          aria-label="Редактировать"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => onOpenDeleteEntryDialog(entry)}
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
        open={deleteConfirmEntry !== null}
        onClose={onCloseDeleteEntryDialog}
      >
        <DialogTitle>Удалить интервал?</DialogTitle>
        <DialogContent>
          {deleteConfirmEntry && (
            <Typography>
              {formatUtcLocal(deleteConfirmEntry.started_at)} —{' '}
              {deleteConfirmEntry.ended_at
                ? formatUtcLocal(deleteConfirmEntry.ended_at)
                : '…'}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDeleteEntryDialog}>Отмена</Button>
          <Button color="error" variant="contained" onClick={onDeleteEntry}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
