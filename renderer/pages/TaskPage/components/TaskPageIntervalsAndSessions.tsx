import type { Task } from '@renderer/shared/types'
import { Box, Tab, Tabs } from '@renderer/shared/ui'
import { useState } from 'react'

import { useTaskPageSessions } from '../hooks'
import type { IntervalsListProps } from './IntervalsList'
import { IntervalsList } from './IntervalsList'
import type { SessionsSectionProps } from './SessionsSection'
import { SessionsSection } from './SessionsSection'

export type TaskPageIntervalsProps = IntervalsListProps
export type TaskPageSessionsProps = SessionsSectionProps

export interface TaskPageIntervalsAndSessionsProps {
  intervals: TaskPageIntervalsProps
  taskId: number
  task: Task | null
  /** Вызвать после конвертации сессии в интервал (обновить список интервалов) */
  onSessionConverted?: () => void
}

export function TaskPageIntervalsAndSessions({
  intervals,
  taskId,
  task,
  onSessionConverted,
}: TaskPageIntervalsAndSessionsProps) {
  const [tab, setTab] = useState<'intervals' | 'sessions'>('intervals')
  const sessions = useTaskPageSessions(taskId, { task, onSessionConverted })

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        sx={{ flexShrink: 0, mb: 2 }}
      >
        <Tab label="Интервалы" value="intervals" />
        <Tab label="Сессии" value="sessions" />
      </Tabs>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {tab === 'intervals' ? (
          <IntervalsList intervals={intervals} />
        ) : (
          <SessionsSection
            sessions={sessions.sessions}
            onConvertSessionToInterval={sessions.handleConvertSessionToInterval}
          />
        )}
      </Box>
    </Box>
  )
}
