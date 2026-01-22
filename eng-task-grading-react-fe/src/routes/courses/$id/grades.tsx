import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useLogger } from '../../../hooks/use-logger';
import { gradeService } from '../../../services/grade-service';
import { courseService } from '../../../services/course-service';
import { Loading } from '../../../ui/loading';
import { LoadingError } from '../../../ui/loadingError';
import { useLoadingState } from '../../../types/loadingState';
import type { CourseDto, CourseOverviewDto, FinalGradeDto } from '../../../model/course-dto';
import type { StudentDto } from '../../../model/student-dto';
import type { TaskDto } from '../../../model/task-dto';
import type { GradeDto } from '../../../model/grade-dto';
import { AddCourseFinalGradeModal } from '../../../components/courses/AddCourseFinalGradeModal';
import { EditCourseFinalGradeModal } from '../../../components/courses/EditCourseFinalGrade';
import { AddGradeModal } from '../../../components/tasks/AddGradeModal';

export const Route = createFileRoute('/courses/$id/grades')({
  component: GradesPage,
})


interface TaskGradeCell {
  taskId: number;
  studentId: number;
  value: number;
  otherValues: number[];
  percentage: number | null;
  isSuccessful: boolean | null;
  date: Date;
}

interface AttendanceCell {
  attendanceId: number;
  studentId: number;
  weight: number;
  isSuccessful: boolean | null;
}

interface TaskHeader {
  id: number;
  title: string;
  description: string | null;
  minGrade: number | null;
  maxGrade: number | null;
}

interface AttendanceHeader {
  id: number;
  title: string;
  minWeight: number | null;
}

interface CourseStudentRow {
  student: StudentDto;
  attendanceSuccessCount: number;
  taskSuccessCount: number;
}

interface FinalGradeCell {
  id: number;
  studentId: number;
  value: number;
  comment: string | null;
  isRecorded: boolean;
  date: Date | null;
  isSuccessfull: boolean;
}

interface CourseTable {
  course: CourseDto;
  students: CourseStudentRow[];
  taskCells: TaskGradeCell[];
  attendanceCells: AttendanceCell[];
  tasks: TaskHeader[];
  attendances: AttendanceHeader[];
  finalGradeCells: FinalGradeCell[];
}

function GradesPage() {
  const { id } = Route.useParams()
  const courseId = id;

  const logger = useLogger("GradesTab");
  const navigate = useNavigate();
  const [tableData, setTableData] = useState<CourseTable | null>(null);
  const ldgState = useLoadingState();
  const [studentFilter, setStudentFilter] = useState<string>("");
  const [taskFilter, setTaskFilter] = useState<string>("");
  const [showTasks, setShowTasks] = useState(true);
  const [showAttendances, setShowAttendances] = useState(true);
  const [isAddCourseFinalGradeModalOpen, setIsAddCourseFinalGradeModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDto | null>(null);
  const [isEditCourseFinalGradeModalOpen, setIsEditCourseFinalGradeModalOpen] = useState(false);
  const [selectedFinalGrade, setSelectedFinalGrade] = useState<FinalGradeDto | null>(null);
  const [isAddGradeModalOpen, setIsAddGradeModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskHeader | null>(null);

  const handleFinalCourseGradeUpdated: (grade: FinalGradeDto) => void = (updatedFinalGrade: FinalGradeDto) => {
    setSelectedFinalGrade(null);
    setSelectedStudent(null);
    setTableData(old => {
      if (!old) return old;
      return {
        ...old,
        finalGradeCells: old.finalGradeCells.map(cell => {
          if (cell.id === updatedFinalGrade.id) {
            return {
              id: updatedFinalGrade.id,
              studentId: updatedFinalGrade.studentId,
              value: updatedFinalGrade.value,
              isRecorded: updatedFinalGrade.recordedDateTime != null,
              date: updatedFinalGrade.recordedDateTime!,
              isSuccessfull: updatedFinalGrade.value >= 50,
              comment: updatedFinalGrade.comment ?? null
            };
          }
          return cell;
        })
      };
    });
  };

  const handleCloseEditCourseFinalGradeModal = () => {
    setIsEditCourseFinalGradeModalOpen(false);
    setSelectedFinalGrade(null);
    setSelectedStudent(null);
  };

  const handleCloseAddCourseFinalGradeModal = () => {
    setIsAddCourseFinalGradeModalOpen(false);
    setSelectedStudent(null);
  };
  const handleFinalCourseGradeAdded: (grade: FinalGradeDto) => void = (newFinalGrade: FinalGradeDto) => {
    setSelectedStudent(null);
    const tmp: FinalGradeCell = {
      id: newFinalGrade.id,
      studentId: newFinalGrade.studentId,
      value: newFinalGrade.value,
      isRecorded: newFinalGrade.recordedDateTime != null,
      date: newFinalGrade.recordedDateTime!,
      isSuccessfull: newFinalGrade.value >= 50,
      comment: newFinalGrade.comment ?? null
    };
    setTableData(old => {
      if (!old) return old;
      return {
        ...old,
        finalGradeCells: [...old.finalGradeCells, tmp]
      }
    });
  }

  const handleAddGrade = (student: StudentDto, task: TaskHeader) => {
    setSelectedStudent(student);
    setSelectedTask(task);
    setIsAddGradeModalOpen(true);
  };

  const handleCloseAddGradeModal = () => {
    setIsAddGradeModalOpen(false);
    setSelectedStudent(null);
    setSelectedTask(null);
  };

  const handleGradeAdded = (newGrade: GradeDto) => {
    // Přenačíst data tabulky
    const data = tableData;
    if (data) {
      const task = data.tasks.find(t => t.id === newGrade.taskId);
      data?.taskCells.push({
        taskId: newGrade.taskId,
        studentId: newGrade.studentId,
        value: newGrade.value,
        otherValues: [],
        percentage: gradeService.calculateFinalGradePercentage(newGrade.value, task?.minGrade || null, task?.maxGrade || null),
        isSuccessful: task?.minGrade && newGrade.value >= task.minGrade ? true : false,
        date: new Date(newGrade.date)
      });
      setTableData({ ...data });
    }
    handleCloseAddGradeModal();
  };

  const deleteFinalGradeAsync = (finalGradeId: number) => async () => {
    const confirmed = window.confirm(
      'Opravdu chceš smazat finální známku? Tuto akci nelze vrátit zpět.'
    );
    if (!confirmed) return;
    try {
      await courseService.deleteFinalGradeAsync(finalGradeId);
      setTableData(old => {
        if (!old) return old;
        return {
          ...old,
          finalGradeCells: old.finalGradeCells.filter(cell => cell.id !== finalGradeId)
        };
      });
    } catch (error) {
      logger.error('Error deleting final grade:', error);
    }
  }

  const markAsRecordedAsync = (finalGradeId: number) => async () => {
    try {
      const res = await courseService.markFinalGradeAsRecordedAsync(finalGradeId);
      setTableData(old => {
        if (!old) return old;
        return {
          ...old,
          finalGradeCells: old.finalGradeCells.map(cell =>
            cell.id === finalGradeId ? { ...cell, isRecorded: true, date: res.recordedDateTime } : cell
          )
        };
      });
    } catch (error) {
      logger.error('Error marking final grade as recorded:', error);
    }
  }
  const unmarkAsRecordedAsync = (finalGradeId: number) => async () => {
    const confirmed = window.confirm(
      'Opravdu chceš zrušit označení známky jako zapsané?'
    );
    if (!confirmed) return;

    try {
      await courseService.unmarkFinalGradeAsRecordedAsync(finalGradeId);
      setTableData(old => {
        if (!old) return old;
        return {
          ...old,
          finalGradeCells: old.finalGradeCells.map(cell =>
            cell.id === finalGradeId ? { ...cell, isRecorded: false, date: null } : cell
          )
        };
      });
    } catch (error) {
      logger.error('Error unmarking final grade as recorded:', error);
    }
  }
  const addCourseFinalGradeAsync = (student: StudentDto) => async () => {
    setSelectedStudent(student);
    setIsAddCourseFinalGradeModalOpen(true);
  }

  const editCourseFinalGradeAsync = (student: StudentDto, finalGradeId: number) => async () => {
    const finalGradeCell = tableData?.finalGradeCells.find(fg => fg.id === finalGradeId);
    const finalGrade: FinalGradeDto = {
      id: finalGradeCell!.id,
      studentId: finalGradeCell!.studentId,
      value: finalGradeCell!.value,
      comment: finalGradeCell!.comment,
      recordedDateTime: finalGradeCell!.isRecorded ? finalGradeCell!.date : null,
      courseId: +courseId
    };
    setSelectedStudent(student);
    setSelectedFinalGrade(finalGrade);
    setIsEditCourseFinalGradeModalOpen(true);
  }

  const buildLocalDataStructure = (data: CourseOverviewDto): CourseTable => {
    const tasks = data.tasks;
    const attendances = data.attendances;

    const taskCells: TaskGradeCell[] = [];
    const attendanceCells: AttendanceCell[] = [];
    const studentRows: CourseStudentRow[] = [];
    const finalGradeCells: FinalGradeCell[] = [];

    data.students.forEach(studentDto => {
      const taskTmp = data.tasks.map(task => {
        const taskDto: TaskDto = data.tasks.find(q => q.id == task.id)!;
        const taskGradesDto = data.grades.filter(g => g.taskId == task.id && g.studentId == studentDto.id);
        if (taskGradesDto.length > 0) {
          const taskFinalGrade = gradeService.evaluateFinalGrade(
            taskDto.aggregation,
            taskGradesDto)!;
          const tmp: TaskGradeCell = {
            taskId: task.id,
            studentId: studentDto.id,
            percentage: gradeService.calculateFinalGradePercentage(taskFinalGrade.value, taskDto.minGrade, taskDto.maxGrade),
            value: taskFinalGrade.value,
            otherValues: taskGradesDto.map(g => g.value),
            isSuccessful: taskDto.minGrade ? taskFinalGrade.value >= taskDto.minGrade : null,
            date: taskFinalGrade.date
          };
          return tmp;
        }
      }).filter((t): t is TaskGradeCell => t !== undefined);
      taskTmp.forEach(tc => taskCells.push(tc));
      const attTmp = data.attendances.map(attendance => {
        const attDto = data.attendances.find(a => a.id == attendance.id)!;
        const attendanceResults = data.attendanceOverview.filter(ar => ar.attendanceId == attendance.id && ar.studentId == studentDto.id);
        const weight = attendanceResults.reduce((sum, ar) => sum + ar.value, 0);
        const tmp: AttendanceCell = {
          attendanceId: attendance.id,
          studentId: studentDto.id,
          weight: weight,
          isSuccessful: attDto.minWeight ? weight >= attDto.minWeight : null
        };
        return tmp;
      });
      attTmp.forEach(ac => attendanceCells.push(ac));
      const fgTmp = data.finalGrades.find(fg => fg.studentId === studentDto.id);
      if (fgTmp) {
        const finGradeCell: FinalGradeCell | null = {
          studentId: studentDto.id,
          value: fgTmp.value,
          isRecorded: fgTmp.recordedDateTime != null,
          date: fgTmp.recordedDateTime,
          isSuccessfull: fgTmp.value >= 50,
          id: fgTmp.id,
          comment: fgTmp.comment ?? null
        };
        finalGradeCells.push(finGradeCell);
      }
      const row: CourseStudentRow = {
        student: data.students.find(s => s.id == studentDto.id)!,
        attendanceSuccessCount: attendanceCells.filter(a => a.isSuccessful).length,
        taskSuccessCount: taskCells.filter(t => t.isSuccessful).length
      };
      studentRows.push(row);
    });

    const ret: CourseTable = {
      course: data.course,
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description ?? null,
        minGrade: t.minGrade ?? null,
        maxGrade: t.maxGrade ?? null
      })),
      attendances: attendances,
      students: studentRows,
      taskCells: taskCells,
      attendanceCells: attendanceCells,
      finalGradeCells: finalGradeCells
    };

    return ret;
  };

  const loadGradeSet = async () => {
    try {
      ldgState.setLoading();
      const data = await courseService.getOverview(courseId);
      const tmp = buildLocalDataStructure(data);
      setTableData(tmp);
      ldgState.setDone();
    } catch (error) {
      logger.error('Error loading grades:', error);
      ldgState.setError(error);
    }
  };

  useEffect(() => {
    loadGradeSet();
  }, [courseId]);

  const handleTaskDetail = (taskId: number) => {
    logger.info("Navigate to task detail", { taskId });
    navigate({ to: `/tasks/${taskId}` });
  };

  const filteredStudents = tableData?.students.filter(student => {
    if (!studentFilter.trim()) return true;

    const searchText = studentFilter.toLowerCase();
    return (
      student.student.number.toLowerCase().includes(searchText) ||
      (student.student.name?.toLowerCase().includes(searchText) ?? false) ||
      (student.student.surname?.toLowerCase().includes(searchText) ?? false)
    );
  });

  // Funkce pro filtrování tasků
  const filteredTasks = tableData?.tasks.filter(task => {
    if (!taskFilter.trim()) return true;

    const searchText = taskFilter.toLowerCase();
    return task.title.toLowerCase().includes(searchText);
  });

  const getGradeColor = (isSuccessful: boolean | null) => {
    if (isSuccessful === null) return "";
    if (isSuccessful) {
      return 'bg-green-100 text-green-800 border border-green-200';
    } else {
      return 'bg-red-100 text-red-800 border border-red-200';
    }
  };

  const getAttendanceColor = (isSuccessful: boolean | null) => {
    if (isSuccessful === null) {
      return 'bg-blue-100 text-blue-800';
    } else if (isSuccessful) {
      return 'bg-green-100 text-green-800 border border-green-200';
    } else {
      return 'bg-red-100 text-red-800 border border-red-200';
    }
  };

  logger.debug(`Rendering grades tab for course ${courseId}`);

  if (ldgState.loading) { return (<Loading message="Načítám známky..." />); }
  if (ldgState.error) { return (<LoadingError message={ldgState.error} onRetry={loadGradeSet} />); }

  if (!tableData) throw new Error("Set is null, unexpectingly.");

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
              {showAttendances && tableData.attendances.map((attendance) => (
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
              {/* Sloupce pro tasks */}
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
              <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-48">
                Final
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents?.map((student) => {
              const finalGradeCell: FinalGradeCell | undefined = tableData.finalGradeCells.find(fg => fg.studentId === student.student.id);

              return (
                <tr key={student.student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                    <div>
                      <div className="font-semibold">{student.student.surname}, {student.student.name}</div>
                      <div className="text-xs text-gray-500">{student.student.number}</div>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center sticky left-0 bg-white z-10" style={{ left: '192px' }}>
                    <div className="font-medium">{student.attendanceSuccessCount} / ??</div>
                    <div className="font-medium">{student.taskSuccessCount} / ??</div>
                  </td>
                  {/* Buňky pro attendance values */}
                  {showAttendances && tableData?.attendances.map((attendance) => {
                    const cell = tableData.attendanceCells.find(q => q.studentId == student.student.id && q.attendanceId == attendance.id);

                    return (
                      <td
                        key={`${student.student.id}-attendance-${attendance.id}`}
                        className="px-2 py-4 text-center text-sm"
                      >
                        {cell ? (
                          <span className={`inline-flex px-4 py-2 text-xs font-semibold rounded-full ${getAttendanceColor(cell.isSuccessful)}`}>
                            {cell.weight.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                    );
                  })}
                  {showTasks && filteredTasks?.map((task) => {
                    const cell = tableData.taskCells.find(q => q.studentId == student.student.id && q.taskId == task.id);

                    return (
                      <td
                        key={`${student.student.id}-${task.id}`}
                        className={`px-2 py-4 text-center text-sm ${getGradeColor(cell?.isSuccessful ?? null)}`}
                      >
                        {cell ? (
                          <div className="space-y-1">
                            <span
                              className="inline-flex px-2 text-xs font-semibold rounded-full"
                            >
                              {cell.value?.toLocaleString("cs-CZ", { maximumFractionDigits: 2 }) ?? "-"} {cell.percentage !== null && `/ ${cell.percentage} %`}
                            </span>
                            {cell.otherValues.length > 1 && (
                              <div className="text-xs opacity-60">
                                ({cell.otherValues.join(', ')})
                              </div>
                            )}
                            <div className="text-xs opacity-75">
                              {cell && <div>{new Date(cell.date).toLocaleDateString('cs-CZ')}</div>}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center space-y-1">
                            <button
                              className="inline-flex items-center justify-center w-6 h-6 text-sm font-medium border-1 bg-white text-green-600 rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              onClick={() => handleAddGrade(student.student, task)}
                              title="Přidat známku"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className={"px-4 py-4 whitespace-nowrap text-sm text-gray-900 sticky left-0 z-10 " + (!finalGradeCell || finalGradeCell?.isRecorded ? "bg-white" : "bg-yellow-200")}>
                    {finalGradeCell ? (
                      <div>
                        <div>
                          <span className={"inline-block pl-1 mr-4 w-8 font-bold " + (finalGradeCell.isSuccessfull ? "text-green-700" : "text-red-600")}>
                            {finalGradeCell.value}
                          </span>
                          <button
                            className="inline-flex items-center justify-center w-6 h-6 text-sm font-medium text-white bg-blue-500 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            title="Upravit známku"
                            onClick={editCourseFinalGradeAsync(student.student, finalGradeCell.id)}>
                            🖉
                          </button>
                          {
                            finalGradeCell.isRecorded &&
                            <button
                              className='inline-flex items-center justify-center w-6 h-6 ml-1 p-3 text-sm font-medium text-red-300 bg-white border border-red-300 rounded-full hover:bg-red-700 hover:text-white'
                              title="Odznačit jako zapsáno"
                              onClick={unmarkAsRecordedAsync(finalGradeCell.id)}>
                              ☐
                            </button>
                          }
                          {!finalGradeCell.isRecorded &&
                            <button
                              className="inline-flex items-center justify-center ml-1 w-6 h-6 text-sm font-medium text-white bg-green-600 rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              title="Potvrdit známku jako zapsanou v systému"
                              onClick={markAsRecordedAsync(finalGradeCell.id)}>
                              🗸
                            </button>
                          }
                          <button
                            className='inline-flex items-center justify-center w-6 h-6 ml-1 p-3 text-sm font-medium text-white bg-red-700 border border-red rounded-full hover:bg-red-700 hover:text-white'
                            title="Smazat známku"
                            onClick={deleteFinalGradeAsync(finalGradeCell.id)}>
                            ⨯
                          </button>
                        </div>
                        {finalGradeCell?.comment && <div className='text-xs pt-2 text-gray-500' >{finalGradeCell.comment ?? ""}</div>}
                        {finalGradeCell.isRecorded && finalGradeCell.date && (
                          <div className="text-xs pt-1 text-gray-500">
                            {new Date(finalGradeCell.date).toLocaleDateString('cs-CZ')}
                          </div>
                        )}
                      </div>) : (<div>
                        <button
                          className='inline-flex items-center justify-center w-6 h-6 text-sm font-medium text-white bg-green-600 rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                          title="Přidat finální známku"
                          onClick={addCourseFinalGradeAsync(student.student)}>
                          +
                        </button>
                      </div>)}
                  </td>
                </tr>
              );
            }
            )}
          </tbody>
        </table>

        {/* Zpráva když nejsou výsledky */}
        {filteredStudents?.length === 0 && studentFilter && (
          <div className="text-center py-8">
            <p className="text-gray-500">Žádní studenti neodpovídají filtru "{studentFilter}".</p>
          </div>
        )}
      </div>

      {/* Add Grade Modal */}
      <AddCourseFinalGradeModal
        isOpen={isAddCourseFinalGradeModalOpen}
        onClose={handleCloseAddCourseFinalGradeModal}
        student={selectedStudent}
        courseId={id}
        onGradeAdded={handleFinalCourseGradeAdded}
      />

      {/* Update Grade Modal */}
      <EditCourseFinalGradeModal
        isOpen={isEditCourseFinalGradeModalOpen}
        onClose={handleCloseEditCourseFinalGradeModal}
        student={selectedStudent}
        grade={selectedFinalGrade}
        onGradeUpdated={handleFinalCourseGradeUpdated}
      />

      {/* Add Grade Modal */}
      <AddGradeModal
        isOpen={isAddGradeModalOpen}
        onClose={handleCloseAddGradeModal}
        student={selectedStudent}
        taskId={selectedTask?.id.toString() ?? ''}
        taskMinGrade={selectedTask?.minGrade ?? null}
        taskMaxGrade={selectedTask?.maxGrade ?? null}
        onGradeAdded={handleGradeAdded}
      />
    </div >
  );


}
