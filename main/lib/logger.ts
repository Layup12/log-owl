import { app } from 'electron'

const PREFIX = '[log-owl]'

export function isDev(): boolean {
  return process.env.NODE_ENV === 'development' || !app.isPackaged
}

export function logDev(message: string, ...args: unknown[]): void {
  if (isDev()) {
    console.log(PREFIX, message, ...args)
  }
}

export function logWarn(message: string, ...args: unknown[]): void {
  console.warn(PREFIX, message, ...args)
}

export function logError(message: string, ...args: unknown[]): void {
  console.error(PREFIX, message, ...args)
}
