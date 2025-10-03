import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { attendanceService } from '../../services/attendance-service'
import type { AttendanceDto } from '../../model/attendance-dto'
import { TabLabelBlock } from '../../ui/tabLabelBlock'
import { TabLabelLink } from '../../ui/tabLabelLink'
import { AttendanceIcon } from '../../ui/icons/attendanceIcon'
import { AttendanceOverviewIcon } from '../../ui/icons/attendanceOverviewIcon'
import { useNavigationContext } from '../../contexts/NavigationContext'
import { useLoadingState } from '../../types/loadingState'
import { Loading } from '../../ui/loading'
import { LoadingError } from '../../ui/loadingError'

export const Route = createFileRoute('/attendances/$id')({
  component: AttendanceDetailPage,
})

function AttendanceDetailPage() {
  const { id } = Route.useParams() // attendanceId
  const [attendance, setAttendance] = useState<AttendanceDto | null>(null)
  const ldgState = useLoadingState();
  const navCtx = useNavigationContext();

  const loadAttendance = async () => {
    try {
      ldgState.setLoading();
      const attendanceData = await attendanceService.getById(+id)
      setAttendance(attendanceData);
      navCtx.setAttendance({ id: attendanceData.id, title: attendanceData.title });
      ldgState.setDone();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při načítání docházky'
      ldgState.setError(errorMessage)
    }
  }

  useEffect(() => {
    loadAttendance()
  }, [id])

  if (ldgState.loading) { return (<Loading message="Načítám docházku..." />) }
  if (ldgState.error) { return (<LoadingError message={ldgState.error} onRetry={loadAttendance} />) }

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
