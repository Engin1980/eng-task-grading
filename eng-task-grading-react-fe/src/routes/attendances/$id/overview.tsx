import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { AttendanceDaySetDto } from '../../../model/attendance-dto';
import { useEffect, useState } from 'react';
import { attendanceService } from '../../../services/attendance-service';
import { useLoadingState } from '../../../types/loadingState';
import { Loading } from '../../../ui/loading';
import { LoadingError } from '../../../ui/loadingError';

export const Route = createFileRoute('/attendances/$id/overview')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id: attendanceId } = Route.useParams(); // attendanceId
  const [data, setData] = useState<AttendanceDaySetDto | null>(null);
  const ldgState = useLoadingState();
  const [studentFilter, setStudentFilter] = useState("");
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      ldgState.setLoading();
      const result = await attendanceService.getAttendanceSet(+attendanceId);
      setData(result);
      ldgState.setDone();
    } catch (error) {
      console.error('Error loading attendance data:', error);
      ldgState.setError(error);
    }
  };

  useEffect(() => {
    loadData();
  }, [attendanceId]);

  // Funkce pro získání attendance hodnoty pro daného studenta a den
  const getAttendanceRecord = (studentId: number, attendanceDayId: number) => {
    if (!data) return null;

    const record = data.items.find(
      item => item.studentId === studentId && item.attendanceDayId === attendanceDayId
    );

    return record || null;
  };

  // Filtrování studentů podle zadaného filtru
  const filteredStudents = data?.students.filter((student) => {
    if (!studentFilter.trim()) return true;

    const filterLower = studentFilter.toLowerCase().trim();
    return (
      (student.name || '').toLowerCase().includes(filterLower) ||
      (student.surname || '').toLowerCase().includes(filterLower) ||
      (student.number || '').toLowerCase().includes(filterLower)
    );
  }) || [];

  if (ldgState.loading) {
    return <Loading message="Načítám data o docházce..." />;
  }

  if(ldgState.error) {
    return <LoadingError message={ldgState.error} onRetry={loadData} />;
  }

  if (!data || data.students.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nejsou k dispozici žádná data pro zobrazení přehledu.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Celkový přehled</h2>
        <input
          type="text"
          value={studentFilter}
          onChange={(e) => setStudentFilter(e.target.value)}
          placeholder="Vyhledat studenta ..."
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 sticky left-0 bg-gray-50 z-10">
                Student
              </th>
              {data.attendanceDays.map((day) => (
                <th
                  key={day.id}
                  className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 min-w-32"
                  title={`Attendance Day: ${day.title}`}
                >
                  <button
                    onClick={() => navigate({ to: `/attendanceDays/${day.id}` })}
                    className="break-words hyphens-auto text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    {day.title}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-200">
                  <div>
                    <div className="font-semibold">{student.surname}, {student.name}</div>
                    <div className="text-xs text-gray-500">{student.number}</div>
                  </div>
                </td>
                {data.attendanceDays.map((day) => {
                  const attendanceRecord = getAttendanceRecord(student.id, day.id);

                  // Výpočet barvy na základě weight (stejný přístup jako v attendanceDays/$id.tsx)
                  let backgroundColor = 'transparent';
                  let textColor = 'rgb(51, 51, 51)';

                  if (attendanceRecord) {
                    const normalizedValue = Math.max(0, Math.min(1, attendanceRecord.attendanceValueWeight)); // Omez na 0-1

                    // Světlejší barvy - mix s bílou (200-255 místo 0-255)
                    const red = Math.round(200 + 55 * (1 - normalizedValue));
                    const green = Math.round(200 + 55 * normalizedValue);

                    backgroundColor = `rgb(${red}, ${green}, 200)`;
                  }

                  return (
                    <td
                      key={`${student.id}-${day.id}`}
                      className="px-3 py-4 text-center text-sm"
                    >
                      {attendanceRecord ? (
                        <span
                          className="inline-flex px-8 py-2 text-xs font-semibold rounded-full"
                          style={{
                            backgroundColor: backgroundColor,
                            color: textColor
                          }}
                        >
                          {attendanceRecord.attendanceValueTitle}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && data && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {studentFilter.trim()
              ? "Žádní studenti nevyhovují zadaným kritériím vyhledávání."
              : "Žádní studenti nejsou zaregistrováni."
            }
          </p>
        </div>
      )}
    </div>
  );
}
