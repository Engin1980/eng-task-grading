import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { AppLogDto } from '../model/applog-dto'
import { appLogService } from '../services/applog-service'

export const Route = createFileRoute('/logs')({
  component: RouteComponent,
})

function RouteComponent() {
  const [logs, setLogs] = useState<AppLogDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')

  const loadLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await appLogService.getAll()
      setLogs(data)
    } catch (err) {
      setError('Chyba při načítání logů')
      console.error('Error loading logs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  // Filtrování logů
  const filteredLogs = logs.filter(log => {
    const matchesText = !filter || 
      log.message?.toLowerCase().includes(filter.toLowerCase()) ||
      log.messageTemplate?.toLowerCase().includes(filter.toLowerCase()) ||
      log.properties?.toLowerCase().includes(filter.toLowerCase())
    
    const matchesLevel = !levelFilter || log.level === levelFilter
    
    return matchesText && matchesLevel
  })

  // Funkce pro určení barvy podle log level
  const getLogLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'information':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'debug':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const uniqueLevels = [...new Set(logs.map(log => log.level).filter(level => level !== null))]

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-gray-500">Načítám logy...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={loadLogs}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Zkusit znovu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Aplikační logy</h1>
        
        {/* Filtry */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="text-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Vyhledat v logu
              </label>
              <input
                id="text-filter"
                type="text"
                placeholder="Hledat ve zprávě, šabloně, vlastnostech..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="level-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Úroveň logu
              </label>
              <select
                id="level-filter"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Všechny úrovně</option>
                {uniqueLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
          
          {(filter || levelFilter) && (
            <div className="mt-3 flex gap-2">
              {filter && (
                <button
                  onClick={() => setFilter('')}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full hover:bg-blue-200"
                >
                  Text: "{filter}"
                  <span className="ml-1 cursor-pointer">×</span>
                </button>
              )}
              {levelFilter && (
                <button
                  onClick={() => setLevelFilter('')}
                  className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full hover:bg-green-200"
                >
                  Úroveň: {levelFilter}
                  <span className="ml-1 cursor-pointer">×</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Statistiky */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{filteredLogs.length}</div>
              <div className="text-sm text-gray-500">Zobrazených záznamů</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{logs.length}</div>
              <div className="text-sm text-gray-500">Celkem záznamů</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {logs.filter(log => log.level?.toLowerCase() === 'error').length}
              </div>
              <div className="text-sm text-gray-500">Chyby</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {logs.filter(log => log.level?.toLowerCase() === 'warning').length}
              </div>
              <div className="text-sm text-gray-500">Varování</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabulka logů */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {filter || levelFilter ? 'Žádné logy neodpovídají filtru.' : 'Nejsou k dispozici žádné logy.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Čas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Úroveň
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zpráva
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Šablona
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vlastnosti
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.timeStamp ? new Date(log.timeStamp).toLocaleString('cs-CZ') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getLogLevelColor(log.level || '')}`}>
                        {log.level || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={log.message || ''}>
                        {log.message || '-'}
                      </div>
                      {log.exception && (
                        <div className="text-xs text-red-600 mt-1 truncate" title={log.exception}>
                          Exception: {log.exception}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate" title={log.messageTemplate || ''}>
                        {log.messageTemplate || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate" title={log.properties || ''}>
                        {log.properties || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
