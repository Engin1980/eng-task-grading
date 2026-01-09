import { createFileRoute } from '@tanstack/react-router'
import type { StudentViewCourseDto } from '../../../../model/student-view-dto';
import { useStudentViewData } from '../../../../contexts/StudentViewDataContext';
import { gradeService } from '../../../../services/grade-service';

interface TaskWithGrades {
  id: number;
  title: string;
  minGrade: number | null;
  maxGrade: number | null;
  grades: {
    date: string;
    rating: number | null;
    isSuccess: boolean | null;
    percentage: number | null;
    comment: string | null;
  }[];
}

export const Route = createFileRoute('/studentView/courses/$id/tasks')({
  component: RouteComponent,
})

function RouteComponent() {
  const courseDataOrNull: StudentViewCourseDto | null = useStudentViewData();
  const courseData = courseDataOrNull!;
  const tasks = courseData.tasks || [];
  const grades = courseData.grades || [];
  const tasksWithGrades: TaskWithGrades[] = tasks.map(task => {
    const taskGrades = grades.filter(g => g.taskId === task.id);
    return {
      id: task.id,
      title: task.title,
      minGrade: task.minGrade,
      maxGrade: task.maxGrade,
      grades: taskGrades.map(grade => ({
        date: grade.date.toString(),
        rating: grade.value,
        isSuccess : task.minGrade == null || grade.value >= task.minGrade,
        percentage: gradeService.calculateFinalGradePercentage(grade.value, task.minGrade, task.maxGrade),
        comment: grade.comment
      }))
    };
  });

  if (tasksWithGrades.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Žádné úkoly</h3>
        <p className="text-gray-500">V tomto kurzu zatím nejsou žádné úkoly.</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Název úkolu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Záznamy Hodnocení
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasksWithGrades.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {task.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    <div>
                      Max body: {task.maxGrade ?? "N/A"}
                    </div>
                    <div>
                      Min body: {task.minGrade ?? "N/A"}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {task.grades.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Datum
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Hodnocení
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Komentář
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {task.grades.map((grade, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {new Date(grade.date).toLocaleDateString('cs-CZ')}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                {grade.rating !== null ? (
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                    ${grade.isSuccess 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                    }`}>
                                    {grade.rating} / {grade.percentage} %
                                  </span>
                                ) : (
                                  <span className="text-gray-400">Neohodnoceno</span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {grade.comment || (
                                  <span className="text-gray-400 italic">Bez komentáře</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic">
                      Zatím neohodnoceno
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
