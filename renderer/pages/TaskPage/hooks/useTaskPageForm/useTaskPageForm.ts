import { getTaskById, updateTask } from '@renderer/api'
import type { Task } from '@renderer/shared/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

export interface TaskPageFormValues {
  title: string
  comment: string
  manualStart: string
  manualEnd: string
  editStart: string
  editEnd: string
}

const normTitle = (v: string) => (v ?? '').trim()

function getTodayDateTimeLocal(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}T00:00`
}

function getDefaultFormValues(): TaskPageFormValues {
  const today = getTodayDateTimeLocal()
  return {
    title: '',
    comment: '',
    manualStart: today,
    manualEnd: today,
    editStart: '',
    editEnd: '',
  }
}

export interface UseTaskPageFormResult {
  task: Task | null
  loading: boolean
  error: string | null
  formFields: TaskPageFormValues
  setFormField: <K extends keyof TaskPageFormValues>(
    name: K,
    value: TaskPageFormValues[K]
  ) => void
  getValues: () => TaskPageFormValues
  saveTitle: () => Promise<void>
  saveComment: () => Promise<void>
  flushPendingSaves: (shouldSkip: boolean) => void
}

export function useTaskPageForm(taskId: number): UseTaskPageFormResult {
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const taskRef = useRef(task)
  taskRef.current = task

  const form = useForm<TaskPageFormValues>({
    defaultValues: getDefaultFormValues(),
  })
  const { watch, setValue, getValues, reset } = form
  const title = watch('title')
  const comment = watch('comment')
  const manualStart = watch('manualStart')
  const manualEnd = watch('manualEnd')
  const editStart = watch('editStart')
  const editEnd = watch('editEnd')

  const loadTask = useCallback(async () => {
    if (!Number.isFinite(taskId)) return
    try {
      setError(null)
      const t = await getTaskById(taskId)
      if (!t) {
        setError('Задача не найдена')
        setTask(null)
        return
      }
      setTask(t)
      reset({
        ...getDefaultFormValues(),
        title: t.title,
        comment: t.comment ?? '',
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [taskId, reset])

  useEffect(() => {
    loadTask()
  }, [loadTask])

  const flushPendingSaves = useCallback(
    (shouldSkip: boolean) => {
      if (shouldSkip) return
      const t = taskRef.current
      const values = getValues()
      const c = values.comment
      const ti = values.title
      if (t && c !== (t.comment ?? '')) {
        updateTask(t.id, { comment: c || null }).catch(() => {})
      }
      if (t && normTitle(ti) !== normTitle(t.title ?? '')) {
        updateTask(t.id, { title: normTitle(ti) || '' }).catch(() => {})
      }
    },
    [getValues]
  )

  const saveTitle = useCallback(async () => {
    if (!task) return
    const current = getValues('title')
    if (normTitle(current) === normTitle(task.title ?? '')) return
    const payload = normTitle(current) || ''
    await updateTask(task.id, { title: payload })
    setTask((t) => (t ? { ...t, title: payload } : null))
    reset({ ...getValues(), title: payload }, { keepDefaultValues: false })
  }, [task, getValues, reset])

  const saveComment = useCallback(async () => {
    if (!task) return
    const current = getValues('comment')
    if (current === (task.comment ?? '')) return
    const payload = current || null
    await updateTask(task.id, { comment: payload })
    setTask((prev) => (prev ? { ...prev, comment: payload ?? '' } : null))
    reset(
      { ...getValues(), comment: payload ?? '' },
      { keepDefaultValues: false }
    )
  }, [task, getValues, reset])

  const formFields: TaskPageFormValues = {
    title,
    comment,
    manualStart,
    manualEnd,
    editStart,
    editEnd,
  }

  return {
    task,
    loading,
    error,
    formFields,
    setFormField: (name, value) => {
      setValue(name, value as never)
    },
    getValues,
    saveTitle,
    saveComment,
    flushPendingSaves,
  }
}
