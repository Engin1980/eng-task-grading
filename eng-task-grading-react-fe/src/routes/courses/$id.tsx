import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/courses/$id')({
  component: CourseDetailPage,
})

function CourseDetailPage() {
  const { id } = Route.useParams() // <- tady vytáhneš parametry

  return (
    <div>
      <h1>Detail kurzu</h1>
      <p>ID kurzu: {id}</p>
    </div>
  )
}