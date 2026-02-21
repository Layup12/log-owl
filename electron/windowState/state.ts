import { app } from 'electron'
import type { BrowserWindow } from 'electron'
import { getDb } from '../db'
import * as appStateRepo from '../repositories/appStateRepository'
import { logWarn } from '../lib/logger'
import { WINDOW_BOUNDS_KEY, WINDOW_FULLSCREEN_KEY } from '../constants/appStateKeys'
import { SAVE_DEBOUNCE_MS } from './constants'
import { parseBounds } from './parseBounds'

let mainWindowRef: BrowserWindow | null = null
let saveWindowStateTimeout: ReturnType<typeof setTimeout> | null = null

export function setMainWindow(win: BrowserWindow | null): void {
  mainWindowRef = win
}

export interface WindowState {
  width: number
  height: number
  x?: number
  y?: number
  fullscreen: boolean
}

export function loadWindowState(): WindowState {
  const db = getDb(app.getPath('userData'))
  const boundsStr = appStateRepo.get(db, WINDOW_BOUNDS_KEY)
  const fullscreenStr = appStateRepo.get(db, WINDOW_FULLSCREEN_KEY)
  const { width, height, x, y } = parseBounds(boundsStr)
  return { width, height, x, y, fullscreen: fullscreenStr === 'true' }
}

export function saveWindowState(): void {
  if (!mainWindowRef || mainWindowRef.isDestroyed()) return
  try {
    const db = getDb(app.getPath('userData'))
    const bounds = mainWindowRef.getBounds()
    const fullscreen = mainWindowRef.isFullScreen()
    appStateRepo.set(db, WINDOW_BOUNDS_KEY, JSON.stringify(bounds))
    appStateRepo.set(db, WINDOW_FULLSCREEN_KEY, fullscreen ? 'true' : 'false')
  } catch (e) {
    logWarn('saveWindowState:', e)
  }
}

export function scheduleSaveWindowState(): void {
  if (saveWindowStateTimeout) clearTimeout(saveWindowStateTimeout)
  saveWindowStateTimeout = setTimeout(() => {
    saveWindowStateTimeout = null
    saveWindowState()
  }, SAVE_DEBOUNCE_MS)
}

/** Вызвать при событии close окна: сбросить отложенное сохранение и сохранить состояние. */
export function onWindowClosing(): void {
  if (saveWindowStateTimeout) {
    clearTimeout(saveWindowStateTimeout)
    saveWindowStateTimeout = null
  }
  saveWindowState()
}
