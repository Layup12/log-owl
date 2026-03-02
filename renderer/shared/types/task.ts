export interface Task {
  id: number
  title: string
  comment: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  is_service: 0 | 1
}
