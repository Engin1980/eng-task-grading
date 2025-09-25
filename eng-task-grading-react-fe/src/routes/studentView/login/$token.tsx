import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/studentView/login/$token')({
  component: RouteComponent,
})

//TODO this is used? or should be deleted?
function RouteComponent() {
  const { token } = Route.useParams()
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Student Login Token
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Token: {token}
        </p>
      </div>
    </div>
  )
}
