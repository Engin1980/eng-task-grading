import { createFileRoute, Link } from '@tanstack/react-router'
import { CreateAttendanceDayModal } from '../../../components/attendances';
import { useEffect, useState } from 'react';
import type { AttendanceDayCreateDto, AttendanceDto } from '../../../model/attendance-dto';
import { attendanceService } from '../../../services/attendance-service';
import { useLoadingState } from '../../../types/loadingState';
import { Loading } from '../../../ui/loading';
import { LoadingError } from '../../../ui/loadingError';
import { useLogger } from '../../../hooks/use-logger';

export const Route = createFileRoute('/attendances/$id/days')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams(); // attendanceId
  const attendanceId = +id;
  const [attendance, setAttendance] = useState<AttendanceDto | null>(null);
  const ldgState = useLoadingState();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const logger = useLogger("attendanceDays/$id/days.tsx");

  const loadAttendance = async () => {
    try {
      ldgState.setLoading();
      const data = await attendanceService.getById(attendanceId);
      setAttendance(data);
      ldgState.setDone();
    } catch (err) {
      logger.error('Error loading attendance:', err);
      ldgState.setError('Chyba při načítání docházky');
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [attendanceId]);

  const handleCreateAttendanceDay = async (attendanceDay: AttendanceDayCreateDto) => {
    try {
      const attendanceDayWithId = {
        ...attendanceDay,
        attendanceId: attendanceId
      };
      await attendanceService.createDay(attendanceDayWithId);
      await loadAttendance(); // Refresh the data
    } catch (err) {
      logger.error('Error creating attendance day:', err);
      throw err; // Re-throw to let modal handle the error
    }
  };

  if (ldgState.loading) { return (<Loading message="Načítám zaznamenané dny..." />); }
  if (ldgState.error) { return (<LoadingError message={ldgState.error} onRetry={loadAttendance} />); }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Zaznamenané dny</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Přidat den
        </button>
      </div>

      {!attendance?.days || attendance.days.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Nejsou k dispozici žádné zaznamenané dny.</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Vytvořit první den
          </button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Název dne
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendance.days.map((day) => (
                <tr key={day.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to="/attendanceDays/$id"
                      params={{ id: day.id.toString() }}
                      className="text-blue-600 hover:text-blue-900 hover:underline"
                    >
                      {day.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateAttendanceDayModal
        attendanceId={attendanceId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateAttendanceDay}
      />
    </div>
  );
}
