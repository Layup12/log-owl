import { useEffect, useState } from 'react'
import { Typography } from '@shared/ui'

interface TimerCounterProps {
  startedAt: string // ISO UTC
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

export function TimerCounter({ startedAt }: TimerCounterProps) {
  const [now, setNow] = useState(() => Date.now())
  const startMs = new Date(startedAt).getTime()

  useEffect(() => {
    const tick = () => setNow(Date.now())
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const elapsed = Math.max(0, now - startMs)
  return (
    <Typography variant="h5" component="span" fontFamily="monospace">
      {formatElapsed(elapsed)}
    </Typography>
  )
}
