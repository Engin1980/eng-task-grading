import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/studentView/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/studentView/studentLogin"!</div>
}
