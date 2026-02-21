import type { IpcResponse } from './ipcResponse'

/**
 * Описание контракта: для каждого канала — аргументы и тип результата (data в IpcResponse).
 */
export type IpcChannelToPayload = Record<
  string,
  { args: unknown[]; result: unknown }
>

/**
 * Типизированный API для window.electron.
 * T — карта канал → { args, result }; view задаёт T, используя доменные типы из @renderer/shared/types.
 */
export interface ElectronApi<T extends IpcChannelToPayload> {
  invoke<C extends keyof T>(
    channel: C,
    ...args: T[C]['args']
  ): Promise<IpcResponse<T[C]['result']>>
}
