import { app } from 'electron'
import { setupAppLifecycle } from './app/lifecycle'
import { runApp } from './app/run'

setupAppLifecycle()

app.whenReady().then(() => {
  runApp()
})
