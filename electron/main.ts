import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { getDb } from './db'
import { runMigrations } from './migrations/runner'
import { registerIpc } from './ipc'
import * as appStateRepo from './repositories/appStateRepository'
import * as timeEntryRepo from './repositories/timeEntryRepository'
import * as taskSessionRepo from './repositories/taskSessionRepository'

const HEARTBEAT_INTERVAL_MS = 45 * 1000
const LAST_SEEN_KEY = 'last_seen_timestamp'
const WINDOW_BOUNDS_KEY = 'window_bounds'
const WINDOW_FULLSCREEN_KEY = 'window_fullscreen'

const DEFAULT_WIDTH = 1200
const DEFAULT_HEIGHT = 800
const MIN_WIDTH = 400
const MIN_HEIGHT = 300

let mainWindow: BrowserWindow | null = null
let recoveryClosedIds: number[] = []
let saveWindowStateTimeout: ReturnType<typeof setTimeout> | null = null

function initDb(): void {
  const userDataPath = app.getPath('userData')
  const db = getDb(userDataPath)
  runMigrations(db)
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('test', 'ok')
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('test') as { value: string } | undefined
  const dbPath = path.join(userDataPath, 'data', 'log-owl.db')
  console.log('[log-owl] DB init OK, userData:', userDataPath, '| DB file:', dbPath, '| settings.test =', row?.value ?? '?')
  const openEntries = timeEntryRepo.getOpen(db)
  if (openEntries.length > 0) {
    const lastSeen = appStateRepo.get(db, LAST_SEEN_KEY) ?? new Date().toISOString()
    for (const entry of openEntries) {
      timeEntryRepo.update(db, entry.id, { ended_at: lastSeen })
      recoveryClosedIds.push(entry.id)
    }
    console.log('[log-owl] Recovery: closed', recoveryClosedIds.length, 'open time_entries with last_seen')
  }
}

function startHeartbeat(): void {
  const db = getDb(app.getPath('userData'))
  const tick = () => {
    appStateRepo.set(db, LAST_SEEN_KEY, new Date().toISOString())
  }
  tick()
  setInterval(tick, HEARTBEAT_INTERVAL_MS)
}

function loadWindowState(): { width: number; height: number; x?: number; y?: number; fullscreen: boolean } {
  const db = getDb(app.getPath('userData'))
  const boundsStr = appStateRepo.get(db, WINDOW_BOUNDS_KEY)
  const fullscreenStr = appStateRepo.get(db, WINDOW_FULLSCREEN_KEY)
  let width = DEFAULT_WIDTH
  let height = DEFAULT_HEIGHT
  let x: number | undefined
  let y: number | undefined
  if (boundsStr) {
    try {
      const b = JSON.parse(boundsStr) as { width?: number; height?: number; x?: number; y?: number }
      const w = b.width
      const h = b.height
      if (typeof w === 'number' && Number.isFinite(w) && typeof h === 'number' && Number.isFinite(h)) {
        width = Math.max(MIN_WIDTH, w)
        height = Math.max(MIN_HEIGHT, h)
        if (typeof b.x === 'number' && Number.isFinite(b.x) && typeof b.y === 'number' && Number.isFinite(b.y)) {
          x = b.x
          y = b.y
        }
      }
    } catch {
      // ignore
    }
  }
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    if (boundsStr) {
      console.log('[log-owl] Window state loaded:', width, 'x', height, fullscreenStr === 'true' ? '(fullscreen)' : '')
    }
  }
  return { width, height, x, y, fullscreen: fullscreenStr === 'true' }
}

function saveWindowState(): void {
  if (!mainWindow || mainWindow.isDestroyed()) return
  try {
    const db = getDb(app.getPath('userData'))
    const bounds = mainWindow.getBounds()
    const fullscreen = mainWindow.isFullScreen()
    appStateRepo.set(db, WINDOW_BOUNDS_KEY, JSON.stringify(bounds))
    appStateRepo.set(db, WINDOW_FULLSCREEN_KEY, fullscreen ? 'true' : 'false')
    if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
      console.log('[log-owl] Window state saved:', bounds.width, 'x', bounds.height, fullscreen ? '(fullscreen)' : '')
    }
  } catch (e) {
    console.warn('[log-owl] saveWindowState:', e)
  }
}

function scheduleSaveWindowState(): void {
  if (saveWindowStateTimeout) clearTimeout(saveWindowStateTimeout)
  saveWindowStateTimeout = setTimeout(() => {
    saveWindowStateTimeout = null
    saveWindowState()
  }, 300)
}

function createWindow(): void {
  const state = loadWindowState()
  const opts: Electron.BrowserWindowConstructorOptions = {
    width: state.width,
    height: state.height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  }
  if (state.x != null && state.y != null) {
    opts.x = state.x
    opts.y = state.y
  }
  mainWindow = new BrowserWindow(opts)
  if (state.fullscreen) {
    mainWindow.setFullScreen(true)
  }
  mainWindow.on('resize', scheduleSaveWindowState)
  mainWindow.on('move', scheduleSaveWindowState)
  mainWindow.on('enter-full-screen', () => saveWindowState())
  mainWindow.on('leave-full-screen', () => saveWindowState())
  mainWindow.on('blur', () => scheduleSaveWindowState()) // сохранить при переключении на другое окно
  mainWindow.on('close', () => {
    if (saveWindowStateTimeout) {
      clearTimeout(saveWindowStateTimeout)
      saveWindowStateTimeout = null
    }
    saveWindowState()
  })
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    // DevTools не открываем автоматически — при необходимости Cmd+Option+I (macOS) или Ctrl+Shift+I
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  initDb()
  registerIpc()
  ipcMain.handle('app:getRecoveryInfo', () => {
    const ids = recoveryClosedIds
    recoveryClosedIds = []
    return { recovered: ids.length > 0, closedIds: ids }
  })
  createWindow()
  startHeartbeat()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  saveWindowState()
  try {
    const db = getDb(app.getPath('userData'))
    const closedAt = new Date().toISOString()
    const n = taskSessionRepo.closeAllOpen(db, closedAt)
    if (n > 0) {
      console.log('[log-owl] Before-quit: closed', n, 'open task_sessions')
    }
  } catch (e) {
    console.warn('[log-owl] before-quit closeAllOpen:', e)
  }
})
