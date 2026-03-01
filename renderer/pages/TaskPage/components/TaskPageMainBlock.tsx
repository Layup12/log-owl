import {
  Delete as DeleteIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material'
import { DeleteTaskConfirmDialog, TimerCounter } from '@renderer/components'
import { useDeleteTaskDialog } from '@renderer/hooks'
import { Box, IconButton, TextField, Tooltip } from '@renderer/shared/ui'

import type { UseTaskPageFormResult } from '../hooks'
import { useTaskPageTimer } from '../hooks'
import { AddIntervalForm } from './AddIntervalForm'

export interface TaskPageMainBlockAddIntervalProps {
  onAddInterval: () => Promise<void>
  manualError: string | null
  onClearManualError: () => void
}

export interface TaskPageMainBlockProps {
  form: Pick<
    UseTaskPageFormResult,
    | 'formFields'
    | 'setFormField'
    | 'saveTitle'
    | 'saveComment'
    | 'flushPendingSaves'
  >
  addInterval: TaskPageMainBlockAddIntervalProps
  taskId: number
  loadTimeEntries: () => Promise<void>
}

export function TaskPageMainBlock({
  form,
  addInterval,
  taskId,
  loadTimeEntries,
}: TaskPageMainBlockProps) {
  const page = useTaskPageTimer(taskId, {
    form,
    loadTimeEntries,
  })
  const deleteTaskDialog = useDeleteTaskDialog()

  const {
    formFields: { title, comment, manualStart, manualEnd },
    setFormField,
    saveTitle,
    saveComment,
  } = form
  const { onAddInterval, manualError, onClearManualError } = addInterval

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {page.isTimerRunning ? (
          <Tooltip title="Стоп">
            <IconButton
              color="primary"
              onClick={page.handleTimerStop}
              aria-label="Стоп"
            >
              <PauseIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Старт">
            <IconButton
              color="primary"
              onClick={page.handleTimerStart}
              aria-label="Старт"
            >
              <PlayIcon />
            </IconButton>
          </Tooltip>
        )}
        {page.isTimerRunning && page.startedAt && (
          <TimerCounter startedAt={page.startedAt} />
        )}
        <Tooltip title="Удалить задачу">
          <IconButton
            color="error"
            onClick={() => deleteTaskDialog.open(taskId)}
            aria-label="Удалить задачу"
            sx={{ ml: 'auto' }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <TextField
        label="Название"
        value={title}
        onChange={(e) => setFormField('title', e.target.value)}
        onBlur={saveTitle}
        fullWidth
      />

      <TextField
        label="Комментарий"
        value={comment}
        onChange={(e) => setFormField('comment', e.target.value)}
        onBlur={saveComment}
        fullWidth
        multiline
        minRows={3}
        sx={{ '& textarea': { resize: 'vertical' } }}
      />

      <AddIntervalForm
        manualStart={manualStart}
        manualEnd={manualEnd}
        setFormField={setFormField}
        onAddInterval={onAddInterval}
        manualError={manualError}
        onClearManualError={onClearManualError}
      />

      <DeleteTaskConfirmDialog
        open={deleteTaskDialog.isOpen}
        onClose={deleteTaskDialog.close}
        taskId={deleteTaskDialog.taskId}
        onDeleted={page.onDeletedAfterDelete}
      />
    </Box>
  )
}
