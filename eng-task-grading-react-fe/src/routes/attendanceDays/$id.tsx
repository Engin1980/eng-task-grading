import { createFileRoute } from '@tanstack/react-router'
import type { StudentDto } from '../../model/student-dto';
import { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendance-service';
import type { AttendanceValueDto, AttendanceRecordDto } from '../../model/attendance-dto';

export const Route = createFileRoute('/attendanceDays/$id')({
  component: AttendanceDayDetailPage,
})

function AttendanceDayDetailPage() {
  const { id } = Route.useParams()
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [values, setValues] = useState<AttendanceValueDto[]>([]);
  const [records, setRecords] = useState<AttendanceRecordDto[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDataAsync = async () => {
    try {
      setLoading(true);
      const tmpZ = await attendanceService.getAttendanceValues();
      setValues(tmpZ.sort((a, b) => b.weight - a.weight)); // Seřaď podle weight sestupně

      const tmpA = await attendanceService.getStudentsByDayId(+id);
      setStudents(tmpA);

      const tmpB = await attendanceService.getRecordsForDay(id);
      setRecords(tmpB);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDataAsync();
  }, [id]);

  const handleSetRecord = async (studentId: number, attendanceValueId: number) => {
    try {
      const newRecord: AttendanceRecordDto = {
        studentId: studentId,
        attendanceDayId: +id,
        attendanceValueId: attendanceValueId
      };

      const savedRecord = await attendanceService.setRecord(newRecord);

      // Aktualizuj records v state
      setRecords(prevRecords => {
        const existingIndex = prevRecords.findIndex(r => r.studentId === studentId);
        if (existingIndex >= 0) {
          // Uprav existující záznam
          const updatedRecords = [...prevRecords];
          updatedRecords[existingIndex] = savedRecord;
          return updatedRecords;
        } else {
          // Přidej nový záznam
          return [...prevRecords, savedRecord];
        }
      });
    } catch (error) {
      console.error('Error setting record:', error);
    }
  };

  const handleDeleteRecord = async (studentId: number) => {
    try {
      const existingRecord = records.find(r => r.studentId === studentId);
      if (existingRecord && existingRecord.id) {
        await attendanceService.deleteRecord(existingRecord.id);

        // Odstraň záznam z state
        setRecords(prevRecords => prevRecords.filter(r => r.studentId !== studentId));
      }
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Detail dne docházky</h1>
        <p className="text-gray-600">ID dne: {id}</p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Záznamy docházky studentů
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Přehled docházky všech studentů pro tento den
          </p>
        </div>

        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance Record
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => {
                  // Najdi attendance record pro tohoto studenta
                  const studentRecord = records.find(record =>
                    record.studentId === student.id
                  );

                  // Najdi odpovídající attendance value pouze pokud existuje studentRecord
                  const attendanceValue = studentRecord
                    ? values.find(value => value.id === studentRecord.attendanceValueId)
                    : null;

                  return (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.name} {student.surname}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {/* Zobraz všechny dostupné attendance values */}
                          {values.map((value) => {
                            const isSelected = attendanceValue?.id === value.id;

                            // Výpočet barvy na základě hodnoty (0-1, červená-zelená)
                            const normalizedValue = Math.max(0, Math.min(1, value.weight)); // Omez na 0-1

                            // Světlejší barvy - mix s bílou (170-255 místo 0-255)
                            const red = Math.round(200 + 55 * (1 - normalizedValue));
                            const redBorder = Math.round(255 * (1 - normalizedValue));
                            const green = Math.round(200 + 55 * normalizedValue);
                            const greenBorder = Math.round(255 * (normalizedValue));

                            // RGB barvy
                            const backgroundColor = `rgb(${red}, ${green}, 200)`;
                            const borderColor = `rgb(${redBorder}, ${greenBorder}, 0)`;

                            // Výpočet barvy textu pro lepší čitelnost
                            const textColor = 'rgb(51, 51, 51)';

                            return (
                              <button
                                key={value.id}
                                onClick={() => handleSetRecord(student.id, value.id)}
                                className="inline-flex px-8 py-2 text-xs font-semibold rounded-full cursor-pointer hover:!bg-yellow-200 transition-colors"
                                style={{
                                  backgroundColor: backgroundColor,
                                  color: textColor,
                                  border: isSelected ? `3px solid ${borderColor}` : 'none'
                                }}
                              >
                                {value.title}
                              </button>
                            );
                          })}

                          <button
                            onClick={() => handleDeleteRecord(student.id)}
                            className="inline-flex px-8 py-2 text-xs font-semibold rounded-full cursor-pointer hover:!bg-yellow-200 transition-colors"
                            style={{
                              backgroundColor: 'rgba(200, 200, 200, 0.3)',
                              color: 'black',
                              border: !attendanceValue ? `3px solid gray` : 'none'
                            }}
                          >
                            Neuvedeno
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {students.length === 0 && (
            <div className="px-6 py-4 text-center text-gray-500">
              No students found for this attendance day.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
