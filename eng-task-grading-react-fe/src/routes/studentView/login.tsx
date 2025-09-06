import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

export const Route = createFileRoute('/studentView/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      personalNumber: '',
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      try {
        // TODO: Implement login logic
        console.log('Login attempt with personal number:', value.personalNumber)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        alert(`Přihlášení s osobním číslem: ${value.personalNumber}`)
      } catch (error) {
        console.error('Login error:', error)
        alert('Chyba při přihlašování')
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Studentské přihlášení
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Zadejte své osobní číslo pro přihlášení
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-6"
          >
            <form.Field
              name="personalNumber"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return 'Osobní číslo je povinné'
                  }
                  if (value.trim().length < 3) {
                    return 'Osobní číslo musí mít alespoň 3 znaky'
                  }
                  return undefined
                },
              }}
            >
              {(field) => (
                <div>
                  <label htmlFor="personalNumber" className="block text-sm font-medium text-gray-700">
                    Osobní číslo
                  </label>
                  <div className="mt-1">
                    <input
                      id="personalNumber"
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Zadejte své osobní číslo..."
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      disabled={isSubmitting}
                    />
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-2 text-sm text-red-600">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || !form.state.canSubmit}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Přihlašuji...' : 'Přihlásit se'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
