import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'
import { TaskCard } from '@renderer/components'
import type { Task } from '@renderer/shared/types'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from '@renderer/shared/ui'

interface CompletedTasksSectionProps {
  tasks: Task[]
  cellSize: number
  open: boolean
  onToggle: () => void
  onTaskOpen: (id: number) => void
  onTasksUpdate: () => void
}

export function CompletedTasksSection({
  tasks,
  cellSize,
  open,
  onToggle,
  onTaskOpen,
  onTasksUpdate,
}: CompletedTasksSectionProps) {
  if (tasks.length === 0) return null

  return (
    <Accordion
      expanded={open}
      onChange={onToggle}
      disableGutters
      square
      sx={{
        flexShrink: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundImage: 'initial',
        '&::before': { display: 'none' },
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ minHeight: 40, '& .MuiAccordionSummary-content': { my: 0.75 } }}
      >
        <Typography variant="body2" color="text.secondary">
          Выполнено ({tasks.length})
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          pt: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            maxHeight: '50vh',
            overflow: 'auto',
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, ${cellSize}px)`,
            gridAutoRows: `${cellSize}px`,
            gap: 1,
          }}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={onTasksUpdate}
              onOpen={() => onTaskOpen(task.id)}
            />
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
