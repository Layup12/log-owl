import { getAllTasks, getTimeEntriesInRange } from '@renderer/api'
import {
  clipIntervalsToRange,
  datetimeLocalToUtcIso,
  formatUtcLocal,
  type Interval,
  mergeIntervals,
  totalMinutesRoundedUp,
} from '@renderer/shared/lib'
import type { TimeEntry } from '@renderer/shared/types'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  TextField,
  Typography,
} from '@renderer/shared/ui'
import { useMemo, useState } from 'react'

interface ReportRow {
  taskId: number
  taskTitle: string
  mergedIntervals: { start: string; end: string }[]
  totalMinutes: number
}

function defaultFrom(): string {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}T00:00`
}

function defaultTo(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day}T${h}:${min}`
}

interface ReportModalProps {
  open: boolean
  onClose: () => void
}

export function ReportModal({ open, onClose }: ReportModalProps) {
  const [from, setFrom] = useState(() => defaultFrom())
  const [to, setTo] = useState(() => defaultTo())
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<ReportRow[] | null>(null)

  const loadReport = async () => {
    setLoading(true)
    setRows(null)
    try {
      const fromIso = datetimeLocalToUtcIso(from)
      const toIso = datetimeLocalToUtcIso(to)
      const [entries, tasks] = await Promise.all([
        getTimeEntriesInRange(fromIso, toIso),
        getAllTasks(),
      ])
      const taskMap = new Map(
        tasks.map((t: { id: number; title?: string | null }) => [t.id, t])
      )
      const byTask = new Map<number, TimeEntry[]>()
      for (const e of entries) {
        if (!byTask.has(e.task_id)) byTask.set(e.task_id, [])
        byTask.get(e.task_id)!.push(e)
      }
      const result: ReportRow[] = []
      for (const [taskId, taskEntries] of byTask) {
        const task = taskMap.get(taskId)
        const intervals: Interval[] = taskEntries.map((e) => ({
          start: e.started_at,
          end: e.ended_at,
        }))
        const clipped = clipIntervalsToRange(intervals, fromIso, toIso)
        const merged = mergeIntervals(clipped)
        const totalMinutes = totalMinutesRoundedUp(clipped)
        result.push({
          taskId,
          taskTitle: task?.title ?? `Задача #${taskId}`,
          mergedIntervals: merged,
          totalMinutes,
        })
      }
      result.sort((a, b) => a.taskTitle.localeCompare(b.taskTitle))
      setRows(result)
    } finally {
      setLoading(false)
    }
  }

  const reportContent = useMemo(() => {
    if (rows === null) return null
    if (rows.length === 0) {
      return (
        <Typography color="text.secondary">Нет данных за период</Typography>
      )
    }
    return (
      <List dense disablePadding>
        {rows.map((r) => (
          <ListItem
            key={r.taskId}
            sx={{ flexDirection: 'column', alignItems: 'stretch', py: 1.5 }}
          >
            <Typography variant="subtitle2" fontWeight="medium">
              {r.taskTitle}
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5, py: 0.5 }}>
              {r.mergedIntervals.map((m, i) => (
                <li key={i}>
                  <Typography variant="body2" color="text.secondary">
                    {formatUtcLocal(m.start)} — {formatUtcLocal(m.end)}
                  </Typography>
                </li>
              ))}
            </Box>
            <Typography variant="body2">Всего: {r.totalMinutes} мин</Typography>
          </ListItem>
        ))}
      </List>
    )
  }, [rows])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Отчёт</DialogTitle>
      <DialogContent sx={{ overflow: 'auto' }}>
        <Box
          sx={{
            pt: 3,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'flex-end',
          }}
        >
          <TextField
            label="С"
            type="datetime-local"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            label="По"
            type="datetime-local"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Box>
        <Box sx={{ minHeight: 120, mt: 2 }}>{reportContent}</Box>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={loadReport} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Показать'}
        </Button>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  )
}
