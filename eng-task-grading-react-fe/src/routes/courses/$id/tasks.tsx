import { createFileRoute } from '@tanstack/react-router'
import { TasksTab } from '../../../components/courses/TasksTab'

export const Route = createFileRoute('/courses/$id/tasks')({
  component: TasksPage,
})

function TasksPage() {
  const { id } = Route.useParams()
  return <TasksTab courseId={id} />
}
