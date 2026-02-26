import { app } from 'electron'

import { setupAppLifecycle } from './app/lifecycle'
import { runApp } from './app/run'
import { configureUserDataFromCli } from './app/userData'

configureUserDataFromCli()

setupAppLifecycle()

app.whenReady().then(() => {
  runApp()
})
