import type Database from 'better-sqlite3'

const VERIFY_KEY = 'test'
const VERIFY_VALUE = 'ok'

/**
 * Проверяет доступ к БД: запись и чтение тестового значения в settings.
 * Возвращает прочитанное значение при успехе, иначе выбрасывает.
 */
export function verifyDbConnection(db: Database.Database): string {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(
    VERIFY_KEY,
    VERIFY_VALUE
  )
  const row = db
    .prepare('SELECT value FROM settings WHERE key = ?')
    .get(VERIFY_KEY) as { value: string } | undefined
  const value = row?.value ?? null
  if (value !== VERIFY_VALUE) {
    throw new Error(
      `DB verify failed: expected "${VERIFY_VALUE}", got ${value}`
    )
  }
  return value
}
