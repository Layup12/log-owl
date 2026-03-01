import type { TaskSession } from '@renderer/shared/types'
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from '@renderer/shared/ui'
import dayjs from 'dayjs'

export interface SessionsSectionProps {
  sessions: TaskSession[]
  onConvertSessionToInterval: (session: TaskSession) => Promise<void>
}

export function SessionsSection({
  sessions,
  onConvertSessionToInterval,
}: SessionsSectionProps) {
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
      <Typography
        variant="subtitle2"
        color="text.secondary"
        gutterBottom
        sx={{ flexShrink: 0 }}
      >
        Сессии (открытия страницы)
      </Typography>
      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'auto' }}>
        <List
          dense
          component="div"
          sx={{ bgcolor: 'action.hover', borderRadius: 1 }}
        >
          {sessions.length === 0 ? (
            <ListItem>
              <ListItemText primary="Нет сессий" />
            </ListItem>
          ) : (
            [...sessions].reverse().map((s) => (
              <ListItem key={s.id}>
                <ListItemText
                  primary={`${dayjs(s.opened_at).format('DD.MM.YYYY HH:mm:ss')} — ${
                    s.closed_at
                      ? dayjs(s.closed_at).format('DD.MM.YYYY HH:mm:ss')
                      : '…'
                  }`}
                />
                {s.closed_at && (
                  <ListItemSecondaryAction>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={async () => {
                        if (!s.closed_at) return
                        await onConvertSessionToInterval(s)
                      }}
                    >
                      В рабочий интервал
                    </Button>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))
          )}
        </List>
      </Box>
    </Box>
  )
}
