import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/studentView/verify/$token')({
  component: RouteComponent,
})

function RouteComponent() {
  const { token } = Route.useParams()
  
  return (
    <div>
      <h1>Student Verification</h1>
      <p>Token: {token}</p>
    </div>
  )
}
