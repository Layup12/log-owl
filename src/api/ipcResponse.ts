/**
 * Типы для структурированных ответов IPC.
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

/**
 * Проверяет, является ли ответ успешным.
 */
export function isIpcSuccess<T>(response: IpcResponse<T>): response is IpcSuccessResponse<T> {
  return response.ok === true
}

/**
 * Извлекает данные из ответа или выбрасывает ошибку.
 */
export function unwrapIpcResponse<T>(response: IpcResponse<T>): T {
  if (isIpcSuccess(response)) {
    return response.data
  }
  throw new Error(response.error)
}
