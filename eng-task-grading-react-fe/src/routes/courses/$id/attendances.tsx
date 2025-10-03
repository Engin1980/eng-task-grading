import { createFileRoute, Link } from '@tanstack/react-router'
import { useLogger } from '../../../hooks/use-logger';
import { useEffect, useState } from 'react';
import type { AttendanceCreateDto, AttendanceDto } from '../../../model/attendance-dto';
import { attendanceService } from '../../../services/attendance-service';
import { CreateAttendanceModal } from '../../../components/attendances';
import { Loading } from '../../../ui/loading';
import { LoadingError } from '../../../ui/loadingError';
import { useLoadingState } from '../../../types/loadingState';

export const Route = createFileRoute('/courses/$id/attendances')({
  component: AttendancesPage,
})

function AttendancesPage() {
  const { id } = Route.useParams()
  const courseId = id;
  const logger = useLogger("AttendancesPage");
  const [attendances, setAttendances] = useState<AttendanceDto[]>([]);
  const ldgState = useLoadingState();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);


  const loadAttendances = async () => {
    try {
      ldgState.setLoading();
      const data = await attendanceService.getAllByCourseId(parseInt(courseId));
      setAttendances(data);
      ldgState.setDone();
    } catch (err) {
      ldgState.setError(err);
      logger.error('Error loading attendances:', err);
    }
  };

  useEffect(() => {
    loadAttendances();
  }, [courseId]);

  const handleCreateAttendance = async (attendance: AttendanceCreateDto) => {
    try {
      await attendanceService.create(parseInt(courseId), attendance);
      await loadAttendances(); // Refresh the list
    } catch (err) {
      logger.error('Error creating attendance:', err);
      throw err; // Re-throw to let modal handle the error
    }
  };

  if (ldgState.loading) {
    return (
      <Loading message="Načítám docházky..." />
    );
  }

  if (ldgState.error) {
    return (
      <LoadingError message={ldgState.error} onRetry={loadAttendances} />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Docházky</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Přidat docházku
        </button>
      </div>

      {attendances.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Nejsou k dispozici žádné docházky.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Název
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Minimální váha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Počet zaznamenaných dnů
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendances.map((attendance) => (
                <tr key={attendance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to="/attendances/$id/days"
                      params={{ id: attendance.id.toString() }}
                      className="text-blue-600 hover:text-blue-900 hover:underline"
                    >
                      {attendance.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendance.minWeight !== undefined && attendance.minWeight !== null ? (
                      attendance.minWeight
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendance.days.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateAttendanceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateAttendance}
      />
    </div>
  );
}
