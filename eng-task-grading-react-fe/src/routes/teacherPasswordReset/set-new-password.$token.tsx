import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useRequestState } from '../../types/requestState'
import { useAuthContext } from '../../contexts/AuthContext'
import { useToast } from '../../hooks/use-toast'

interface ResetPasswordForm {
  email: string
  password: string
  confirmPassword: string
}

export const Route = createFileRoute('/teacherPasswordReset/set-new-password/$token')({
  component: RouteComponent,
})

function RouteComponent() {
  const { token } = Route.useParams()
  const navigate = useNavigate()
  const reqSubmit = useRequestState();
  const [formData, setFormData] = useState<ResetPasswordForm>({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const authContext = useAuthContext();
  const tst = useToast();

  const handleChange = (field: keyof ResetPasswordForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      tst.warning(tst.WRN.PASSWORDS_DO_NOT_MATCH);
      return
    }

    try {
      reqSubmit.setBusy()
      await authContext.setNewTeacherPassword(token, formData.email, formData.password);
      reqSubmit.setDone()
      tst.success(tst.SUC.PASSWORD_RESET_SUCCESS);
      setTimeout(() => navigate({ to: '/login' }), 2000)
    } catch (error) {
      reqSubmit.setError(error)
      tst.error(error);
      reqSubmit.setReady()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Nastavení nového hesla
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Zadejte své nové heslo
          </p>
        </div>

        {(reqSubmit.ready || reqSubmit.busy) && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange('email')}
                  className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="E-mailová adresa"
                />
              </div>

              <div>
                <label htmlFor="password" className="sr-only">
                  Nové heslo
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange('password')}
                  className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Nové heslo"
                  minLength={8}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Potvrzení hesla
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Potvrzení hesla"
                  minLength={8}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={reqSubmit.busy}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {reqSubmit.busy ? 'Nastavuji...' : 'Nastavit nové heslo'}
              </button>
            </div>
          </form>
        )}

        {reqSubmit.done && (
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800 text-center">
              Heslo bylo úspěšně změněno.
            </p>
            <p className="text-green-800 text-sm text-center mt-2">
              Nyní se můžete přihlásit.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}