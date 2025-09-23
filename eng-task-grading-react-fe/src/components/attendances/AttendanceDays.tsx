import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { attendanceService } from '../../services/attendance-service';
import { CreateAttendanceDayModal } from './CreateAttendanceDayModal';
import { type AttendanceDto, type AttendanceDayCreateDto } from '../../model/attendance-dto';

interface AttendanceDaysProps {
  attendanceId: string;
}

export function AttendanceDays({ attendanceId }: AttendanceDaysProps) {
  const [attendance, setAttendance] = useState<AttendanceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await attendanceService.getById(parseInt(attendanceId));
      setAttendance(data);
    } catch (err) {
      setError('Chyba při načítání docházky');
      console.error('Error loading attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [attendanceId]);

  const handleCreateAttendanceDay = async (attendanceDay: AttendanceDayCreateDto) => {
    try {
      const attendanceDayWithId = {
        ...attendanceDay,
        attendanceId: parseInt(attendanceId)
      };
      await attendanceService.createDay(attendanceDayWithId);
      await loadAttendance(); // Refresh the data
    } catch (err) {
      console.error('Error creating attendance day:', err);
      throw err; // Re-throw to let modal handle the error
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Zaznamenané dny</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">Načítám data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Zaznamenané dny</h2>
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <button
            onClick={loadAttendance}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Zkusit znovu
          </button>
        </div>
      </div>
    );
  }

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
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateAttendanceDay}
      />
    </div>
  );
}
