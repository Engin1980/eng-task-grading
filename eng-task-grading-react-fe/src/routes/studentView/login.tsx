import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useState, useCallback, useEffect } from 'react'
import { Turnstile } from '../../components/turnstille'
import { SuccessModal } from '../../components/studentView/SuccessModal'
import AppSettings from '../../config/app-settings'
import toast from 'react-hot-toast'
import type { StudentViewLoginDto } from '../../model/student-view-login-dto'
import { studentViewService } from '../../services/student-view-service'

export const Route = createFileRoute('/studentView/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Cloudflare konfigurace z AppSettings
  const isCloudflareEnabled = AppSettings.cloudflare.enabled
  const TURNSTILE_SITE_KEY = AppSettings.cloudflare.siteKey

  // Toast upozornění pokud chybí site key (pouze pokud je Cloudflare enabled)
  useEffect(() => {
    if (isCloudflareEnabled && !TURNSTILE_SITE_KEY) {
      toast.error('Chyba: VITE_CLOUDFLARE_SITE_KEY není nastaven v .env.local');
    }
  }, [isCloudflareEnabled, TURNSTILE_SITE_KEY]);

  // Stabilní callback pro captcha aby se neměnil při každém re-renderu
  const handleCaptchaVerify = useCallback((token: string) => {
    setCaptchaToken(token)
  }, [])

  const form = useForm({
    defaultValues: {
      studentNumber: '',
    },
    onSubmit: async ({ value }) => {
      // Kontrola captcha pouze pokud je Cloudflare enabled
      if (isCloudflareEnabled && !captchaToken) {
        toast.error('Prosím dokončete ověření captcha')
        return
      }

      setIsSubmitting(true)
      try {

        const data: StudentViewLoginDto = {
          studentNumber: value.studentNumber,
          captchaToken: isCloudflareEnabled ? (captchaToken || undefined) : undefined
        };

        await studentViewService.login(data);
        setShowSuccessModal(true)
        form.reset()
        setCaptchaToken(null) // Reset captcha token po úspěšném odeslání

      } catch (error) {
        console.error('Login error:', error)
        toast.error('Chyba při přihlašování')
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  // Debug: zobrazení captcha tokenu
  useEffect(() => {
    console.log('captchaToken:', captchaToken);
  }, [captchaToken]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Studentské přihlášení
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Zadejte své studentské číslo pro přihlášení.
          <br />
          Po přihlášení Vám bude zaslán ověřovací odkaz na Váš email.
          <br />
          Přes tento odkaz se dostanete do systému.
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
              name="studentNumber"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return 'Osobní číslo je povinné'
                  }

                  const studentNumberRegex = /^[A-Za-z]\d{5}$/
                  if (!studentNumberRegex.test(value.trim())) {
                    return 'Osobní studentské číslo musí být ve formátu: jedno písmeno následované 5 číslicemi (např. A12345)'
                  }

                  return undefined
                },
              }}
            >
              {(field) => (
                <div>
                  <label htmlFor="studentNumber" className="block text-sm font-medium text-gray-700">
                    Osobní studentské číslo
                  </label>
                  <div className="mt-1">
                    <input
                      id="studentNumber"
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Např. R99873"
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

            {/* Turnstile Captcha */}
            {isCloudflareEnabled && (
              <div>
                {TURNSTILE_SITE_KEY ? (
                  <Turnstile
                    siteKey={TURNSTILE_SITE_KEY}
                    onVerify={handleCaptchaVerify}
                  />
                ) : (
                  <div className="text-red-600 text-sm text-center py-4">
                    Chyba: VITE_CLOUDFLARE_SITE_KEY není nastaven v .env.local
                  </div>
                )}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={
                  isSubmitting || 
                  !form.state.canSubmit || 
                  (isCloudflareEnabled && !captchaToken)
                }
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Přihlašuji...' : 'Přihlásit se'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Úspěšně odesláno!"
        message="Ověřovací odkaz byl odeslán na Váš email. Pokračujte dle instrukcí v emailu."
      />
    </div>
  )
}
