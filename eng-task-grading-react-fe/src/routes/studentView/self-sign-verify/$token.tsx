import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { attendanceService } from '../../../services/attendance-service'
import { Loading } from '../../../ui/loading'
import { useLoadingState } from '../../../types/loadingState'

export const Route = createFileRoute('/studentView/self-sign-verify/$token')({
  component: RouteComponent,
})

function RouteComponent() {
  const { token } = Route.useParams()
  const ldg = useLoadingState();

  useEffect(() => {
    ldg.setLoading();
    const doVerify = async () => {
      try {
        await attendanceService.verifySelfSignKey(token)
        ldg.setDone();
      } catch (err) {
        ldg.setError();
      }
    }

    doVerify()
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">Ověřování samo-přihlášení</h1>

        {ldg.loading && (
          <div className="text-center">
            <Loading message="Probíhá ověření..." />
          </div>
        )}

        {ldg.done && (
          <div className="text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-700 mb-2">Úspěch</h2>
            <p className="text-sm text-gray-600 mb-4">Ověření proběhlo úspěšně.</p>
            <a
              href="/studentView/login"
              className="inline-block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            >
              Zpět na přihlášení
            </a>
          </div>
        )}

        {ldg.error && (
          <div className="text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-700 mb-2">Neúspěch</h2>
            <p className="text-sm text-gray-600 mb-4">Ověření selhalo. Zkuste prosím zkontrolovat odkaz.</p>
            <a
              href="/studentView/login"
              className="inline-block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            >
              Zpět na přihlášení
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
