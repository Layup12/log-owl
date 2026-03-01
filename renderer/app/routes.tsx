import { TaskListPage, TaskPage } from '@renderer/pages'
import { Route, Routes } from 'react-router'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TaskListPage />} />
      <Route path="/task/:id" element={<TaskPage />} />
    </Routes>
  )
}
