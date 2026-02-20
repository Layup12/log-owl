import { Routes, Route } from 'react-router-dom'
import { TaskListPage } from '../pages/TaskListPage/TaskListPage'
import { TaskPage } from '../pages/TaskPage/TaskPage'
import { NewTaskPage } from '../pages/NewTaskPage/NewTaskPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TaskListPage />} />
      <Route path="/task/new" element={<NewTaskPage />} />
      <Route path="/task/:id" element={<TaskPage />} />
    </Routes>
  )
}
