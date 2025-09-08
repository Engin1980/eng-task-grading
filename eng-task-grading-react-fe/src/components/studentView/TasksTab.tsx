import type { TaskDto } from '../../model/task-dto';
import type { GradeDto } from '../../model/grade-dto';

interface TasksTabProps {
  tasks: TaskDto[];
  grades: GradeDto[];
}

interface TaskWithGrade {
  id: number;
  title: string;
  grade?: {
    date: string;
    rating: number | null;
    comment: string | null;
  };
}

export function TasksTab({ tasks, grades }: TasksTabProps) {
  // Combine tasks with their grades
  const tasksWithGrades: TaskWithGrade[] = tasks.map(task => {
    const grade = grades.find(g => g.taskId === task.id);
    return {
      id: task.id,
      title: task.title,
      grade: grade ? {
        date: grade.date.toString(),
        rating: grade.value,
        comment: grade.comment
      } : undefined
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
                Hodnocení
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
                </td>
                <td className="px-6 py-4">
                  {task.grade ? (
                    <div className="grid grid-cols-3 gap-4">
                      {/* Datum */}
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                          Datum
                        </div>
                        <div className="text-sm text-gray-900">
                          {new Date(task.grade.date).toLocaleDateString('cs-CZ')}
                        </div>
                      </div>
                      
                      {/* Hodnocení */}
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                          Hodnocení
                        </div>
                        <div className="text-sm">
                          {task.grade.rating !== null ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              task.grade.rating >= 90 ? 'bg-green-100 text-green-800' :
                              task.grade.rating >= 70 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {task.grade.rating}%
                            </span>
                          ) : (
                            <span className="text-gray-400">Neohodnoceno</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Komentář */}
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                          Komentář
                        </div>
                        <div className="text-sm text-gray-900">
                          {task.grade.comment || (
                            <span className="text-gray-400 italic">Bez komentáře</span>
                          )}
                        </div>
                      </div>
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
