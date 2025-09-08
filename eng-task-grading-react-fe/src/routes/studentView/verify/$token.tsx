import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { studentViewService } from '../../../services/student-view-service'
import type { StudentViewTokenDto } from '../../../model/student-view-dto'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/studentView/verify/$token')({
  component: RouteComponent,
})

function convertDurationToSeconds(duration: string): number {
  // Parse the duration string and convert to seconds
  const match = duration.match(/^(\d+)([mMhdwy])$/)
  
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`)
  }
  
  const value = parseInt(match[1], 10)
  const unit = match[2]
  
  switch (unit) {
    case 'm': // minutes
      return value * 60
    case 'h': // hours
      return value * 60 * 60
    case 'd': // days
      return value * 60 * 60 * 24
    case 'w': // weeks
      return value * 60 * 60 * 24 * 7
    case 'M': // months (approximated as 30 days)
      return value * 60 * 60 * 24 * 30
    case 'y': // years (approximated as 365 days)
      return value * 60 * 60 * 24 * 365
    default:
      throw new Error(`Unsupported duration unit: ${unit}`)
  }
}

function RouteComponent() {
  const { token } = Route.useParams()
  const navigate = useNavigate()
  const [selectedDuration, setSelectedDuration] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const confirmTokenAndDuration = async (token: string, duration: string) => {
    const durationSeconds = convertDurationToSeconds(duration)

    const tokens:StudentViewTokenDto = await studentViewService.verify(token, durationSeconds);
    
    // Store JWT to localStorage for subsequent requests
    localStorage.setItem('studentViewAccessJWT', tokens.accessToken)
    localStorage.setItem('studentViewRefreshJWT', tokens.refreshToken)

    // Navigate to courses page after successful verification
    navigate({ to: '/studentView/courses' })
  }

  const handleConfirm = async () => {
    if (!selectedDuration) return
    
    setIsLoading(true)
    try {
      await confirmTokenAndDuration(token, selectedDuration)
    } catch (error) {
      console.error('Error confirming token:', error)
      
      // Check if it's a 401 Unauthorized error
      if (error instanceof Error && error.message.includes('401')) {
        toast.error('Token je neplatný nebo vypršel. Požádejte o nový odkaz pro ověření.')
      } else if (error instanceof Response && error.status === 401) {
        toast.error('Token je neplatný nebo vypršel. Požádejte o nový odkaz pro ověření.')
      } else {
        toast.error('Došlo k chybě při ověřování. Zkuste to prosím znovu.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const durationOptions = [
    { value: '5m', label: '5 minut', description: 'Krátká relace pro rychlé úkoly' },
    { value: '30m', label: '30 minut', description: 'Standardní práce s úkoly' },
    { value: '1d', label: '1 den', description: 'Celý den práce' },
    { value: '1w', label: '1 týden', description: 'Týdenní přístup' },
    { value: '1M', label: '1 měsíc', description: 'Měsíční přístup' },
    { value: '2M', label: '2 měsíce', description: 'Dlouhodobější přístup' },
    { value: '6M', label: '6 měsíců', description: 'Půlroční přístup' },
    { value: '1y', label: '1 rok', description: 'Roční přístup' },
  ]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ověření přístupu</h1>
          <p className="text-gray-600">Vyberte, jak dlouho chcete mít aktivní přístup z tohoto prohlížeče.</p>
<p className="text-gray-600">
Po uplynutí lhůty nebo odhlášení budete muset znovu ověřit svůj přístup pomocí odkazu zaslaného na váš email.
</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {durationOptions.map((option) => (
            <label
              key={option.value}
              className={`block p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                selectedDuration === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="duration"
                value={option.value}
                checked={selectedDuration === option.value}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.description}</div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedDuration === option.value
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedDuration === option.value && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selectedDuration || isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
            !selectedDuration || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Ověřuji...
            </div>
          ) : (
            'Potvrdit a aktivovat přístup'
          )}
        </button>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Token: <span className="font-mono">{token.substring(0, 8)}...</span>
          </p>
        </div>
      </div>
    </div>
  )
}
