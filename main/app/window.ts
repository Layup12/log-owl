import { isDev } from '@main/lib'
import { BrowserWindow } from 'electron'
import path from 'path'

import {
  loadWindowState,
  onWindowClosing,
  saveWindowState,
  scheduleSaveWindowState,
  setMainWindow,
} from '../windowState'

export function createWindow(): void {
  const state = loadWindowState()
  const opts: Electron.BrowserWindowConstructorOptions = {
    width: state.width,
    height: state.height,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  }
  if (state.x != null && state.y != null) {
    opts.x = state.x
    opts.y = state.y
  }
  const mainWindow = new BrowserWindow(opts)
  setMainWindow(mainWindow)
  if (state.fullscreen) {
    mainWindow.setFullScreen(true)
  }
  mainWindow.on('resize', scheduleSaveWindowState)
  mainWindow.on('move', scheduleSaveWindowState)
  mainWindow.on('enter-full-screen', () => saveWindowState())
  mainWindow.on('leave-full-screen', () => saveWindowState())
  mainWindow.on('blur', () => scheduleSaveWindowState())
  mainWindow.on('close', onWindowClosing)
  if (isDev()) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(
      path.join(__dirname, '..', '..', '..', 'dist', 'index.html')
    )
  }
}
