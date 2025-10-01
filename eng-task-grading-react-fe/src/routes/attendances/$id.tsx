import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { attendanceService } from '../../services/attendance-service'
import type { AttendanceDto } from '../../model/attendance-dto'
import { TabLabelBlock } from '../../ui/tabLabelBlock'
import { TabLabelLink } from '../../ui/tabLabelLink'
import { AttendanceIcon } from '../../ui/icons/attendanceIcon'
import { AttendanceOverviewIcon } from '../../ui/icons/attendanceOverviewIcon'
import { useNavigationContext } from '../../contexts/NavigationContext'

export const Route = createFileRoute('/attendances/$id')({
  component: AttendanceDetailPage,
})

function AttendanceDetailPage() {
  const { id } = Route.useParams() // attendanceId
  const [attendance, setAttendance] = useState<AttendanceDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navCtx = useNavigationContext();

  const loadAttendance = async () => {
    try {
      setLoading(true)
      setError(null)
      const attendanceData = await attendanceService.getById(+id)
      setAttendance(attendanceData);
      navCtx.setAttendance({ id: attendanceData.id, title: attendanceData.title });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při načítání docházky'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAttendance()
  }, [id])

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Načítám docházku...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Chyba při načítání docházky</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadAttendance}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Zkusit znovu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {attendance?.title || `Docházka ${id}`}
        </h1>
        <p className="text-gray-600">ID docházky: {id}</p>
        {attendance && (
          <div className="text-sm text-gray-500 mt-2">
            <span>Zaznamenaných dnů: {attendance.days?.length || 0}</span>
            <span className="mx-2">•</span>
            <span>Minimální váha: {attendance.minWeight || "Nezadáno"}</span>
          </div>
        )}
      </div>

      {/* Tabs - nová navigace přes Link */}
      <TabLabelBlock selectedTabKey='days'>
        <TabLabelLink to={`/attendances/${id}/days`} tabKey='days'>
          <AttendanceIcon />
          Zaznamenané dny
        </TabLabelLink>
        <TabLabelLink to={`/attendances/${id}/overview`} tabKey='overview'>
          <AttendanceOverviewIcon />
          Celkový přehled
        </TabLabelLink>
      </TabLabelBlock>

      {/* Tab Content - nyní se renderuje podle child route */}
      <div className="min-h-96">
        <Outlet />
      </div>
    </div>
  )
}
