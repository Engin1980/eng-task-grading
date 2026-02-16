import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import type { AttendanceDaySelfSignCreateDto } from '../../model/attendance-dto'
import { attendanceService } from '../../services/attendance-service'
import { useToast } from '../../hooks/use-toast';
import { useLogger } from '../../hooks/use-logger';
import { useLoadingState } from '../../types/loadingState';

export const Route = createFileRoute('/attendanceSelfSign/self-sign/$id')({
  component: SelfSignComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      key: typeof search.key === 'string' ? search.key :
        typeof search.key === 'number' ? String(search.key) :
          search.key ? String(search.key) : undefined,
    }
  },
})

function SelfSignComponent() {
  const { id } = Route.useParams()
  const { key: urlKey } = Route.useSearch()
  const [key, setKey] = useState(urlKey || '')
  const [studyNumber, setStudyNumber] = useState('')
  const [errors, setErrors] = useState<{ studyNumber?: string; key?: string }>({})
  const tst = useToast();
  const logger = useLogger("/attendanceSelfSign/self-sign/$id.tsx");
  const [submitted, setSubmitted] = useState(false);
  const ldgState = useLoadingState();

  const validateStudyNumber = (value: string): boolean => {
    const pattern = /^[A-Za-z]\d{5}$/
    return pattern.test(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: { studyNumber?: string; key?: string } = {}

    if (!validateStudyNumber(studyNumber)) {
      newErrors.studyNumber = 'Studijní číslo musí být ve formátu C##### (písmeno následované 5 číslicemi)'
    }

    if (!key || !key.trim()) {
      newErrors.key = 'Klíč je povinný'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {

      const data: AttendanceDaySelfSignCreateDto = {
        key: key,
        studyNumber: studyNumber.toUpperCase(),
      };

      try {
        setSubmitted(true);
        await attendanceService.addSelfStudentRecord(parseInt(id), data);
        tst.success(tst.SUC.ITEM_CREATED);
        ldgState.setDone();
      } catch (error) {
        logger.error('Chyba při odesílání žádosti o zápis:', error);
        tst.error(error);
        ldgState.setError(error);
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-md mx-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Studentský zápis docházky
          </h1>
          <p className="text-gray-600 mt-1">
            Zadejte své údaje pro zápis docházky
          </p>
        </div>

        <div className="px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-2">Klíč pro studentský zápis:</label>
              <input
                type="text"
                id="key"
                name="key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.key ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Zadejte klíč"
                required
                disabled={submitted}
              />
              {errors.key && (
                <p className="text-red-600 text-sm mt-1">{errors.key}</p>
              )}
            </div>
            <div>
              <label htmlFor="studyNumber" className="block text-sm font-medium text-gray-700 mb-2">Studijní číslo:</label>
              <input
                type="text"
                id="studyNumber"
                name="studyNumber"
                value={studyNumber}
                onChange={(e) => setStudyNumber(e.target.value.toUpperCase())}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.studyNumber ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Např. A12345"
                pattern="[A-Za-z]\d{5}"
                maxLength={6}
                required
                disabled={submitted}
              />
              {errors.studyNumber && (
                <p className="text-red-600 text-sm mt-1">{errors.studyNumber}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">Formát: písmeno následované 5 číslicemi (např. A12345)</p>
            </div>
            {!submitted && (
              <button
                type="submit"
                disabled={submitted}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Zapsat docházku
              </button>
            )}
            {submitted && ldgState.loading && <p className="text-center text-sm text-gray-600">Zapisuji docházku...</p>}
            {ldgState.done && (
              <div className="mt-4 text-green-700 text-center text-sm font-semibold">
                Žádost o zápis byla úspěšně odeslána. Pro potvrzení žádosti prosím potvrďte odkaz v zaslaném e-mailu.
              </div>
            )}
            {ldgState.error && (
              <div className="mt-4 text-red-500 text-center text-sm font-semibold">
                Chyba při zápisu docházky.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}