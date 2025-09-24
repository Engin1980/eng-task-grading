import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useLogger } from '../../hooks/use-logger';
import type { GradeSet, GradeDto } from '../../model/grade-dto';
import { gradeService } from '../../services/grade-service';
import type { AttendanceSetDto } from '../../model/attendance-dto';
import { attendanceService } from '../../services/attendance-service';
import type { StudentDto } from '../../model/student-dto';

interface GradesTabProps {
  courseId: string;
}

export function GradesTab({ courseId }: GradesTabProps) {
  const logger = useLogger("GradesTab");
  const navigate = useNavigate();
  const [gradeSet, setGradeSet] = useState<GradeSet | null>(null);
  const [attendanceSet, setAttendanceSet] = useState<AttendanceSetDto | null>(null);
  const [unitedStudents, setUnitedStudents] = useState<StudentDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [studentFilter, setStudentFilter] = useState<string>("");
  const [taskFilter, setTaskFilter] = useState<string>("");
  const [showTasks, setShowTasks] = useState(true);
  const [showAttendances, setShowAttendances] = useState(true);

  const loadGradeSet = async () => {
    try {
      setLoading(true);
      const data = await gradeService.getGradesByCourse(courseId);
      setGradeSet(data);
      const dota = await attendanceService.getCourseSet(+courseId);
      setAttendanceSet(dota);

      // prunik studentu:
      const allStudents = [
        ...(gradeSet?.students ?? []),
        ...(dota?.students ?? [])
      ];
      const uniqueStudentIds = new Set(allStudents.map(student => student.id));
      setUnitedStudents(allStudents.filter(student => uniqueStudentIds.has(student.id)));
    } catch (error) {
      logger.error('Error loading grades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGradeSet();
  }, [courseId]);

  // Funkce pro navigaci na detail úkolu
  const handleTaskDetail = (taskId: number) => {
    logger.info("Navigate to task detail", { taskId });
    navigate({ to: `/tasks/${taskId}` });
  };

  // Funkce pro filtrování studentů z unitedStudents
  const filteredStudents = unitedStudents.filter(student => {
    if (!studentFilter.trim()) return true;

    const searchText = studentFilter.toLowerCase();
    return (
      student.number.toLowerCase().includes(searchText) ||
      (student.name?.toLowerCase().includes(searchText) ?? false) ||
      (student.surname?.toLowerCase().includes(searchText) ?? false)
    );
  });

  // Funkce pro filtrování tasků
  const filteredTasks = gradeSet?.tasks.filter(task => {
    if (!taskFilter.trim()) return true;

    const searchText = taskFilter.toLowerCase();
    return task.title.toLowerCase().includes(searchText);
  });

  // Funkce pro získání všech známek pro konkrétního studenta a task
  const getGradesForStudentAndTask = (studentId: number, taskId: number): GradeDto[] => {
    if (!gradeSet) return [];

    // Najdeme všechny známky pro danou kombinaci studenta a tasku
    const studentGrades = gradeSet.grades.filter(
      grade => grade.studentId === studentId && grade.taskId === taskId
    );

    // Seřadíme podle data vzestupně (nejstarší první, nejnovější poslední)
    return studentGrades.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  };

  // Funkce pro barevné označení známek
  const getGradeColor = (value: number, minGrade: number) => {
    if (value >= minGrade) {
      return 'bg-green-100 text-green-800 border border-green-200';
    } else {
      return 'bg-red-100 text-red-800 border border-red-200';
    }
  };

  // Funkce pro barevné označení attendance podle minWeight
  const getAttendanceColor = (value: number, minWeight?: number) => {
    if (minWeight === undefined || minWeight === null) {
      // Pokud není minWeight nastavena, použij neutrální modrou barvu
      return 'bg-blue-100 text-blue-800';
    }

    if (value >= minWeight) {
      return 'bg-green-100 text-green-800 border border-green-200';
    } else {
      return 'bg-red-100 text-red-800 border border-red-200';
    }
  };

  // Funkce pro získání attendance hodnoty pro studenta
  const getAttendanceValueForStudent = (studentId: number, attendanceId: number): number | null => {
    if (!attendanceSet) return null;

    const item = attendanceSet.items.find(
      item => item.studentId === studentId && item.attendanceId === attendanceId
    );

    return item ? item.value : null;
  };

  // Výpočet úspěšných úkolů pro studenta
  const getStudentStats = (studentId: number) => {
    if (!filteredTasks) return { successful: 0, total: 0 };

    let successful = 0;
    const total = filteredTasks.length;

    filteredTasks.forEach(task => {
      const allGrades = getGradesForStudentAndTask(studentId, task.id);
      if (allGrades.length > 0) {
        const mainGrade = allGrades[allGrades.length - 1]; // Poslední podle data
        if (mainGrade.value >= (task.minGrade || 0)) {
          successful++;
        }
      }
    });
    return { successful, total };
  };

  // Výpočet úspěšných docházek pro studenta
  const getAttendanceStats = (studentId: number) => {
    if (!showAttendances || !attendanceSet) return { successful: 0, total: 0 };
    let successful = 0;
    const total = attendanceSet.attendances.length;
    attendanceSet.attendances.forEach(attendance => {
      const value = getAttendanceValueForStudent(studentId, attendance.id);
      if (value !== null && attendance.minWeight !== undefined && value >= attendance.minWeight) {
        successful++;
      }
    });
    return { successful, total };
  };

  logger.debug(`Rendering grades tab for course ${courseId}`);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Načítám známky...</p>
      </div>
    );
  }

  if (!gradeSet || gradeSet.students.length === 0 || gradeSet.tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nejsou k dispozici žádná data pro zobrazení známek.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtry */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="student-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filtr studentů
            </label>
            <input
              id="student-filter"
              type="text"
              placeholder="Hledat podle jména, příjmení nebo čísla..."
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setStudentFilter('');
                }
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="task-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filtr úkolů
            </label>
            <input
              id="task-filter"
              type="text"
              placeholder="Hledat podle názvu úkolu..."
              value={taskFilter}
              onChange={(e) => setTaskFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setTaskFilter('');
                }
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-6 mt-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={showAttendances}
              onChange={e => setShowAttendances(e.target.checked)}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Zobrazit docházku</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={showTasks}
              onChange={e => setShowTasks(e.target.checked)}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Zobrazit úkoly</span>
          </label>
        </div>

        {(studentFilter || taskFilter) && (
          <div className="mt-3 flex gap-2">
            {studentFilter && (
              <button
                onClick={() => setStudentFilter('')}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full hover:bg-blue-200"
              >
                Studenti: "{studentFilter}"
                <span className="ml-1 cursor-pointer">×</span>
              </button>
            )}
            {taskFilter && (
              <button
                onClick={() => setTaskFilter('')}
                className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full hover:bg-green-200"
              >
                Úkoly: "{taskFilter}"
                <span className="ml-1 cursor-pointer">×</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabulka */}
      <div className="overflow-x-auto">
        <table className="bg-white border border-gray-200 rounded-lg table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-48">
                Student
              </th>
              <th className="px-3 py-3 border-b border-gray-200 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-24" style={{ left: '192px' }}>
                Úspěšnost doch. <br /> úkolů
              </th>
              {/* Sloupce pro attendances */}
              {showAttendances && attendanceSet?.attendances.map((attendance) => (
                <th
                  key={`attendance-${attendance.id}`}
                  className="min-w-24 max-w-48 px-2 py-3 border-b border-gray-200 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  title={`Attendance: ${attendance.title}`}
                >
                  <button
                    onClick={() => navigate({ to: `/attendances/${attendance.id}` })}
                    className="break-words hyphens-auto text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    {attendance.title}
                  </button>
                  <div className="text-xs text-gray-400 font-normal">Min: {attendance.minWeight ?? "-"}</div>
                </th>
              ))}
              {showTasks && filteredTasks?.map((task) => (
                <th
                  key={task.id}
                  className="min-w-24 max-w-48 px-2 py-3 border-b border-gray-200 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  title={task.description || task.title}
                >
                  <button
                    onClick={() => handleTaskDetail(task.id)}
                    className="break-words hyphens-auto text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    {task.title}
                  </button>
                  <div className="text-xs text-gray-400 font-normal">Min: {task.minGrade ?? "-"}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents?.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                  <div>
                    <div className="font-semibold">{student.surname}, {student.name}</div>
                    <div className="text-xs text-gray-500">{student.number}</div>
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center sticky left-0 bg-white z-10" style={{ left: '192px' }}>
                  {(() => {
                    const stats = getAttendanceStats(student.id);
                    return (
                      <div className="font-medium">{stats.successful}/{stats.total}</div>
                    );
                  })()}
                  {(() => {
                    const stats = getStudentStats(student.id);
                    return (
                      <div className="font-medium">{stats.successful}/{stats.total}</div>
                    );
                  })()}
                </td>
                {/* Buňky pro attendance values */}
                {showAttendances && attendanceSet?.attendances.map((attendance) => {
                  const attendanceValue = getAttendanceValueForStudent(student.id, attendance.id);

                  return (
                    <td
                      key={`${student.id}-attendance-${attendance.id}`}
                      className="px-2 py-4 text-center text-sm"
                    >
                      {attendanceValue !== null ? (
                        <span className={`inline-flex px-4 py-2 text-xs font-semibold rounded-full ${getAttendanceColor(attendanceValue, attendance.minWeight)}`}>
                          {attendanceValue.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                  );
                })}
                {showTasks && filteredTasks?.map((task) => {
                  const allGrades = getGradesForStudentAndTask(student.id, task.id);
                  const mainGrade = allGrades.length > 0 ? allGrades[allGrades.length - 1] : null; // Poslední podle data
                  const otherGrades = allGrades.slice(0, -1); // Všechny kromě poslední

                  return (
                    <td
                      key={`${student.id}-${task.id}`}
                      className={`px-2 py-4 text-center text-sm ${mainGrade ? getGradeColor(mainGrade.value, task.minGrade || 0) : ''
                        }`}
                    >
                      {mainGrade ? (
                        <div className="space-y-1">
                          <span
                            className="inline-flex px-2 text-xs font-semibold rounded-full"
                            title={mainGrade.comment || undefined}
                          >
                            {mainGrade.value}
                          </span>
                          {otherGrades.length > 0 && (
                            <div className="text-xs opacity-60">
                              ({otherGrades.map(g => g.value).join(', ')})
                            </div>
                          )}
                          <div className="text-xs opacity-75">
                            {new Date(mainGrade.date).toLocaleDateString('cs-CZ')}
                          </div>
                        </div>
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

        {/* Zpráva když nejsou výsledky */}
        {filteredStudents?.length === 0 && studentFilter && (
          <div className="text-center py-8">
            <p className="text-gray-500">Žádní studenti neodpovídají filtru "{studentFilter}".</p>
          </div>
        )}

        {filteredTasks?.length === 0 && taskFilter && (
          <div className="text-center py-8">
            <p className="text-gray-500">Žádné úkoly neodpovídají filtru "{taskFilter}".</p>
          </div>
        )}
      </div>
    </div>
  );
}
