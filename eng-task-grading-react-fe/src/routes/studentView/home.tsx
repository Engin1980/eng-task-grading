import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/studentView/home')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/studentView/home"!</div>
}
