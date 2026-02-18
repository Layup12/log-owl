/** UTC ISO string → value for input type="datetime-local" (local time, с секундами). */
export function utcIsoToDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const sec = String(d.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${day}T${h}:${min}:${sec}`
}

/** Local datetime-local string → UTC ISO */
export function datetimeLocalToUtcIso(local: string): string {
  return new Date(local).toISOString()
}

/** UTC ISO → local formatted for display (с секундами для истинной длительности). */
export function formatUtcLocal(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
