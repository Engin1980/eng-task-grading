import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/studentView/courses')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/studentView/courses"!</div>
}
