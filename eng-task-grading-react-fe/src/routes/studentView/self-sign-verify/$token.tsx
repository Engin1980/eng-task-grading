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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Ověřuji samo-přihlášení do docházky kurzu...</h1>

        {ldg.loading && <Loading message="Probíhá ověření..." />}

        {ldg.done && (
          <div className="bg-white rounded-lg shadow p-6 border border-green-100">
            <div className="text-green-700 font-medium">Úspěch</div>
            <div className="text-sm text-gray-600">Ověření proběhlo úspěšně.</div>
          </div>
        )}

        {ldg.error && (
          <div className="bg-white rounded-lg shadow p-6 border border-red-100">
            <div className="text-red-700 font-medium">Neúspěch</div>
            <div className="text-sm text-gray-600">Ověření selhalo. Zkuste prosím zkontrolovat odkaz.</div>
          </div>
        )}
      </div>
    </div>
  )
}
