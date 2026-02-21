/**
 * Типы и хелперы для структурированных ответов IPC.
 * Общий контракт для main (возврат из хендлеров) и view (обработка ответов).
 */

export interface IpcSuccessResponse<T> {
  ok: true
  data: T
}

export interface IpcErrorResponse {
  ok: false
  error: string
}

export type IpcResponse<T> = IpcSuccessResponse<T> | IpcErrorResponse

export function isIpcSuccess<T>(
  response: IpcResponse<T>
): response is IpcSuccessResponse<T> {
  return response.ok === true
}

export function unwrapIpcResponse<T>(response: IpcResponse<T>): T {
  if (isIpcSuccess(response)) {
    return response.data
  }
  throw new Error(response.error)
}

/** Ответ app:getRecoveryInfo */
export interface RecoveryInfo {
  recovered: boolean
  closedIds: number[]
}
