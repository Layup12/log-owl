import { Route, Routes } from 'react-router-dom'

import { NewTaskPage } from '../pages/NewTaskPage/NewTaskPage'
import { TaskListPage } from '../pages/TaskListPage/TaskListPage'
import { TaskPage } from '../pages/TaskPage/TaskPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TaskListPage />} />
      <Route path="/task/new" element={<NewTaskPage />} />
      <Route path="/task/:id" element={<TaskPage />} />
    </Routes>
  )
}
