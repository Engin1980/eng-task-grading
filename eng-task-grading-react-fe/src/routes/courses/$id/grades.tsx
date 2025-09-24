import { createFileRoute } from '@tanstack/react-router'
import { GradesTab } from '../../../components/courses/GradesTab'

export const Route = createFileRoute('/courses/$id/grades')({
  component: GradesPage,
})

function GradesPage() {
  const { id } = Route.useParams()
  return <GradesTab courseId={id} />
}
