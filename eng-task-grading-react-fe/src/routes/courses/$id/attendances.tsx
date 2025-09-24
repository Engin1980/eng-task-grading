import { createFileRoute } from '@tanstack/react-router'
import { AttendanceTab } from '../../../components/courses/AttendanceTab'

export const Route = createFileRoute('/courses/$id/attendances')({
  component: AttendancesPage,
})

function AttendancesPage() {
  const { id } = Route.useParams()
  return <AttendanceTab courseId={id} />
}
