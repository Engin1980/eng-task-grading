import { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendance-service';
import type { CourseStudentDto } from '../../model/student-dto';
import type { AttendanceValueDto, AttendanceRecordDto } from '../../model/attendance-dto';
import { AttendanceValueLabelBlock } from '../../ui/attendanceValueLabelBlock';
import { AttendanceValueLabel } from '../../ui/attendanceValueLabel';
import { AttendanceValueUnsetLabel } from '../../ui/attendanceValueUnsetLabel';
import { useToast } from '../../hooks/use-toast';
import { useLogger } from '../../hooks/use-logger';
import { useTranslation } from 'react-i18next';

interface AttendanceRecordsTabProps {
  attendanceDayId: number;
}

export function AttendanceRecordsTab({ attendanceDayId }: AttendanceRecordsTabProps) {
  const [students, setStudents] = useState<CourseStudentDto[]>([]);
  const [groupFilter, setGroupFilter] = useState<string>('');
  const [values, setValues] = useState<AttendanceValueDto[]>([]);
  const [records, setRecords] = useState<AttendanceRecordDto[]>([]);
  const [loading, setLoading] = useState(true);
  const tst = useToast();
  const { t } = useTranslation('attendances');
  const logger = useLogger("AttendanceRecordsTab");

  const loadDataAsync = async () => {
    try {
      setLoading(true);
      const tmpZ = await attendanceService.getAttendanceValues();
      setValues(tmpZ.sort((a, b) => b.weight - a.weight)); // Seřaď podle weight sestupně

      const tmpA = await attendanceService.getStudentsByDayId(+attendanceDayId);
      // Seřaď studenty podle příjmení; pokud je příjmení prázdné, použij `number`
      setStudents((tmpA || []).sort((x, y) => {
        const a = x.student;
        const b = y.student;
        const sa = a.surname?.trim();
        const sb = b.surname?.trim();
        if (sa && sb) return sa.localeCompare(sb);
        if (!sa && !sb) return (Number(a.number ?? 0) - Number(b.number ?? 0));
        return sa ? -1 : 1;
      }));

      const tmpB = await attendanceService.getRecordsForDay(attendanceDayId);
      setRecords(tmpB);
    } catch (error) {
      logger.error('Error loading data:', error);
      tst.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDataAsync();
  }, [attendanceDayId]);

  const handleSetRecord = async (studentId: number, attendanceValueId: number) => {
    try {
      const newRecord: AttendanceRecordDto = {
        studentId: studentId,
        attendanceDayId: +attendanceDayId,
        attendanceValueId: attendanceValueId
      };

      const savedRecord = await attendanceService.setRecord(newRecord);
      tst.success(tst.SUC.ITEM_CREATED);

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
      logger.error('Error setting record:', error);
      tst.error(error);
    }
  };

  const handleDeleteRecord = async (studentId: number) => {
    try {
      const existingRecord = records.find(r => r.studentId === studentId);
      if (existingRecord && existingRecord.id) {
        await attendanceService.deleteRecord(existingRecord.id);

        // Odstraň záznam z state
        setRecords(prevRecords => prevRecords.filter(r => r.studentId !== studentId));
        tst.success(tst.SUC.ITEM_DELETED);
      }
    } catch (error) {
      logger.error('Error deleting record:', error);
      tst.error(error);
    }
  };

  const filteredStudents = students.filter(({ studyGroup }) => {
    if (!groupFilter.trim()) return true;
    return studyGroup !== '' && studyGroup.toLowerCase().includes(groupFilter.trim().toLowerCase());
  });

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center gap-4">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {t('records.title')}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {t('records.subtitle')}
          </p>
        </div>
        <div className="max-w-sm">
          <input
            type="text"
            placeholder={t('records.groupPlaceholder')}
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setGroupFilter('');
              }
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('student')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('records.record')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map(({ student, studyGroup }) => {
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
                      <div className="text-sm font-semibold text-gray-900">
                        {student.surname}, {student.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {student.number}
                        {studyGroup !== '' && (
                          <span className="border rounded border-gray-300 px-1 ml-1">{studyGroup}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <AttendanceValueLabelBlock>
                        {values.map((value) => {
                          return <AttendanceValueLabel
                            key={value.id}
                            attendanceValue={value}
                            isSelected={attendanceValue?.id === value.id}
                            onClick={() => handleSetRecord(student.id, value.id)} />
                        })}
                        <AttendanceValueUnsetLabel isSelected={!attendanceValue} onClick={() => handleDeleteRecord(student.id)} />
                      </AttendanceValueLabelBlock>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {students.length > 0 && filteredStudents.length === 0 && (
          <div className="px-6 py-4 text-center text-gray-500">
            {t('records.noMatch')}
          </div>
        )}

        {students.length === 0 && (
          <div className="px-6 py-4 text-center text-gray-500">
            {t('records.noStudents')}
          </div>
        )}
      </div>
    </div>
  );
}