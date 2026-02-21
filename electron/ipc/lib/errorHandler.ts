import type { IpcMainInvokeEvent } from 'electron'
import type { ZodType } from 'zod'
import { logError } from '../../lib/logger'

export interface IpcSuccessResponse<T> {
  ok: true
  data: T
}

export interface IpcErrorResponse {
  ok: false
  error: string
}

export type IpcResponse<T> = IpcSuccessResponse<T> | IpcErrorResponse

/** Форматирует ошибку Zod в читаемую строку для ответа рендереру. */
function formatZodError(error: { issues: Array<{ path: unknown[]; message: string }> }): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length
        ? issue.path.map((p) => String(p)).join('.')
        : 'value'
      return `${path}: ${issue.message}`
    })
    .join('; ')
}

/**
 * Валидирует аргументы по схемам Zod и вызывает handler с провалидированными значениями.
 * При невалидных данных бросает Error (ловит handleIpc → { ok: false, error }).
 */
function validateArgs<T extends unknown[]>(
  schemas: ZodType<unknown>[],
  args: unknown[]
): T {
  if (schemas.length !== args.length) {
    throw new Error(
      `Invalid arguments: expected ${schemas.length} argument(s), got ${args.length}`
    )
  }
  return args.map((arg, i) => {
    const result = schemas[i].safeParse(arg)
    if (!result.success) {
      throw new Error(formatZodError(result.error))
    }
    return result.data
  }) as T
}

/**
 * Обёртка для IPC-хендлеров: ловит ошибки, логирует их и возвращает структурированный ответ.
 * @param channel имя канала для логирования
 * @param handler функция-хендлер
 */
export function handleIpc<T>(
  channel: string,
  handler: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<T> | T
): (event: IpcMainInvokeEvent, ...args: any[]) => Promise<IpcResponse<T>> {
  return async (event, ...args) => {
    try {
      const result = await handler(event, ...args)
      return { ok: true, data: result }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError(`IPC ${channel}:`, errorMessage, error)
      return { ok: false, error: errorMessage }
    }
  }
}

/**
 * IPC-хендлер с валидацией аргументов: сначала проверяет args по schemas (Zod),
 * затем вызывает handler с провалидированными значениями. Ошибки валидации возвращаются
 * как { ok: false, error: string } (тот же контракт, что и handleIpc).
 * @param channel имя канала для логирования
 * @param schemas массив Zod-схем, по одной на каждый аргумент хендлера (кроме event)
 * @param handler функция-хендлер, получает (event, ...validatedArgs)
 */
export function validateAndHandle<T, A extends unknown[]>(
  channel: string,
  schemas: { [K in keyof A]: ZodType<A[K]> },
  handler: (event: IpcMainInvokeEvent, ...args: A) => Promise<T> | T
): (event: IpcMainInvokeEvent, ...args: any[]) => Promise<IpcResponse<T>> {
  return handleIpc(channel, async (event, ...args: unknown[]) => {
    const validated = validateArgs<A>(schemas as ZodType<unknown>[], args)
    return handler(event, ...validated)
  })
}
