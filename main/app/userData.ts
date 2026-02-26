import { app } from 'electron'

const USER_DATA_FLAG = '--log-owl-user-data'

export function configureUserDataFromCli(): void {
  const prefix = `${USER_DATA_FLAG}=`
  const arg = process.argv.find((value) => value.startsWith(prefix))
  if (!arg) return

  const userDataPath = arg.slice(prefix.length)
  if (!userDataPath) return

  app.setPath('userData', userDataPath)
}
