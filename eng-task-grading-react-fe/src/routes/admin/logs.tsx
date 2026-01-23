import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { AppLogDto } from '../../model/applog-dto'
import { appLogService } from '../../services/applog-service'
import { Loading } from '../../ui/loading'
import { LoadingError } from '../../ui/loadingError'
import { useLoadingState } from '../../types/loadingState'
import { AppLogDetailModal } from '../../components/appLog/AppLogDetailModal'
import { useLogger } from '../../hooks/use-logger'
import { useToast } from '../../hooks/use-toast'

export const Route = createFileRoute('/admin/logs')({
  component: RouteComponent,
})

function RouteComponent() {
  const [logs, setLogs] = useState<AppLogDto[]>([])
  const ldgState = useLoadingState();
  const [filter, setFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [selectedLogIndex, setSelectedLogIndex] = useState<number | null>(null)
  const logger = useLogger("/logs.tsx");
  const tst = useToast();

  const loadLogs = async () => {
    try {
      ldgState.setLoading();
      const data = await appLogService.getAll()
      setLogs(data)
      ldgState.setDone();
    } catch (err) {
      ldgState.setError('Chyba při načítání logů')
      logger.error('Error loading logs:', err)
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
      log.properties?.toLowerCase().includes(filter.toLowerCase()) ||
      log.sourceContext?.toLowerCase().includes(filter.toLowerCase())

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

  const handleRowClick = (log: AppLogDto) => {
    const index = filteredLogs.indexOf(log)
    setSelectedLogIndex(index)
  }

  const handleCloseModal = () => {
    setSelectedLogIndex(null)
  }

  const handleDeleteAll = async () => {
    if (!window.confirm('Opravdu chcete smazat všechny logy? Tuto akci nelze vrátit.')) return;

    try {
      await appLogService.deleteAll();
      logger.info('All logs deleted');
      tst.success(tst.SUC.ITEM_DELETED);
      await loadLogs();
    } catch (err) {
      logger.error('Error deleting all logs:', err);
      tst.error(err);
    }
  };

  const handleDeleteOld = async () => {
    if (!window.confirm('Opravdu chcete smazat staré logy? Tuto akci nelze vrátit.')) return;

    try {
      await appLogService.deleteOld();
      logger.info('Old logs deleted');
      await loadLogs();
      tst.success(tst.SUC.ITEM_DELETED);
    } catch (err) {
      logger.error('Error deleting old logs:', err);
      tst.error(err);
    }
  };

  const handleReloadLogs = async () => {
    try {
      await loadLogs();
    } catch (err) {
      logger.error('Error reloading logs:', err);
      tst.error(err);
    }
  };

  if (ldgState.loading) return (<Loading message="Načítám logy, to může chvilku trvat..." />)
  if (ldgState.error) { return (<LoadingError message={ldgState.error} onRetry={loadLogs} />) }

  return (
    <div className="container mx-auto p-4">
      {/* ...existing code... */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Aplikační logy</h1>

        {/* Filtry */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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

            <div className="flex items-center justify-end gap-2">
              <button
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                onClick={handleReloadLogs}
              >Obnovit</button>
              <button
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                onClick={handleDeleteOld}
              >Vymazat staré</button>
              <button
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-red-100 text-base font-medium text-red-700 hover:bg-red-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                onClick={handleDeleteAll}
              >Vymazat vše</button>
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
      {
        filteredLogs.length === 0 ? (
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
                    {/* První sloupec: stáhneme na minimum, zakážeme zalomení */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-px whitespace-nowrap">
                      Čas
                    </th>
                    {/* Druhý sloupec: stejně jako první */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-px whitespace-nowrap">
                      Úroveň
                    </th>
                    {/* Třetí sloupec: Source/Context */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-px whitespace-nowrap">
                      Zdroj
                    </th>

                    {/* Čtvrtý sloupec: sebere zbytek místa */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zpráva
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => handleRowClick(log)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.timeStamp ? new Date(log.timeStamp).toLocaleString('cs-CZ') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getLogLevelColor(log.level || '')}`}>
                          {log.level || 'N/A'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.sourceContext || '-'}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                        <div className="break-words overflow-wrap-anywhere" title={log.message || ''}>
                          {log.message || '-'}
                        </div>
                        {log.exception && (
                          <div className="font-mono text-xs text-red-600 mt-1" title={log.exception}>
                            ... exception details
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }

      {
        selectedLogIndex !== null && (
          <AppLogDetailModal
            isOpen={selectedLogIndex !== null}
            logs={filteredLogs}
            index={selectedLogIndex}
            onClose={handleCloseModal}
          />
        )
      }
    </div >)
}