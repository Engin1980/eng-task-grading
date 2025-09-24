import { createFileRoute } from '@tanstack/react-router'
import { StudentsTab } from '../../../components/courses/StudentsTab'

export const Route = createFileRoute('/courses/$id/students')({
  component: StudentsPage,
})

function StudentsPage() {
  const { id } = Route.useParams()
  return <StudentsTab courseId={id} />
}
