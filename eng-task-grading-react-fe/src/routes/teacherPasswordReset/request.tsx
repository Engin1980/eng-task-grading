import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useRequestState } from '../../types/requestState'
import { useAuthContext } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/teacherPasswordReset/request')({
  component: RouteComponent,
})

function RouteComponent() {
  const [email, setEmail] = useState('')
  const reqSubmit = useRequestState();
  const authContext = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      reqSubmit.setBusy();
      await authContext.requestTeacherPasswordReset(email)
      reqSubmit.setDone();
    } catch (error) {
      reqSubmit.setError(error);
      toast.error('Došlo k chybě při odesílání požadavku na reset hesla.');
      reqSubmit.setReady();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Reset hesla
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Zadejte e-mail pro reset hesla
          </p>
        </div>

        {(reqSubmit.ready || reqSubmit.busy) && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="E-mailová adresa"
              />
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={reqSubmit.busy}
              >
                {reqSubmit.busy ? 'Odesílám...' : 'Odeslat požadavek'}
              </button>
            </div>
          </form>
        )}

        {reqSubmit.done && (
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800 text-center">
              Pokud e-mail existuje v našem systému, byl odeslán odkaz pro reset hesla.
            </p>
            <p className="text-green-800 text-sm text-center mt-2">
              Zkontrolujte svou e-mailovou schránku.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}