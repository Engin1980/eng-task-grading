import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useLogger } from '../../hooks/use-logger';
import { attendanceService } from '../../services/attendance-service';
import { CreateAttendanceModal } from '../attendances';
import type { AttendanceDto, AttendanceCreateDto } from '../../model/attendance-dto';

interface AttendanceTabProps {
  courseId: string;
}

export function AttendanceTab({ courseId }: AttendanceTabProps) {
  const logger = useLogger("AttendanceTab");
  const [attendances, setAttendances] = useState<AttendanceDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadAttendances = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await attendanceService.getAllByCourseId(parseInt(courseId));
      setAttendances(data);
    } catch (err) {
      setError('Chyba při načítání docházek');
      logger.error('Error loading attendances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendances();
  }, [courseId]);

  const handleCreateAttendance = async (attendance: AttendanceCreateDto) => {
    try {
      await attendanceService.createAttendance(parseInt(courseId), attendance);
      await loadAttendances(); // Refresh the list
    } catch (err) {
      logger.error('Error creating attendance:', err);
      throw err; // Re-throw to let modal handle the error
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Načítám docházky...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={loadAttendances}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Zkusit znovu
        </button>
      </div>
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
                  Počet zaznamenaných dnů
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendances.map((attendance) => (
                <tr key={attendance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to="/attendances/$id"
                      params={{ id: attendance.id.toString() }}
                      className="text-blue-600 hover:text-blue-900 hover:underline"
                    >
                      {attendance.title}
                    </Link>
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
