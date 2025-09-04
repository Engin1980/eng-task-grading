import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react';
import type { TaskDto } from '../../model/task-dto';
import type { StudentDto } from '../../model/student-dto';
import type { GradeDto, GradeSet } from '../../model/grade-dto';
import { gradeService } from '../../services/grade-service';
import { taskService } from '../../services/task-service';
import { AddGradeModal } from '../../components/tasks';

export const Route = createFileRoute('/tasks/$id')({
  component: RouteComponent,
})

interface DataSet {
  studentDatas: StudentData[];
}

interface StudentData {
  student: StudentDto;
  grades: GradeDto[];
}


function RouteComponent() {
  const { id } = Route.useParams()
  const [task, setTask] = useState<TaskDto | null>(null);
  const [data, setData] = useState<DataSet>();
  const [filterText, setFilterText] = useState<string>("");
  const [isAddGradeModalOpen, setIsAddGradeModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDto | null>(null);

  // Funkce pro filtrování studentů
  const filteredStudentData = data?.studentDatas.filter(studentData => {
    if (!filterText.trim()) return true;
    
    const searchText = filterText.toLowerCase();
    const student = studentData.student;
    return (
      student.number.toLowerCase().includes(searchText) ||
      (student.name?.toLowerCase().includes(searchText) ?? false) ||
      (student.surname?.toLowerCase().includes(searchText) ?? false)
    );
  });

  const loadData = async () => {
     const task: TaskDto = await taskService.get(id);
     setTask(task);
     const gradeSet: GradeSet = await gradeService.getGradesByTask(id);
    const data: DataSet = transformData(gradeSet);
    setData(data);
  }

  const transformData = (gradeSet: GradeSet) => {
    const studentDatas: StudentData[] = gradeSet.students.map(student => ({
      student,
      grades: gradeSet.grades.filter(grade => grade.studentId === student.id).sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      }),
    }));
    return { studentDatas };
  }

  const handleAddGrade = (student: StudentDto) => {
    console.log('handleAddGrade called with student:', student.name);
    setSelectedStudent(student);
    setIsAddGradeModalOpen(true);
  };

  const handleGradeAdded = (newGrade: GradeDto) => {
    // Aktualizace dat s novou známkou
    if (data) {
      const updatedStudentDatas = data.studentDatas.map(studentData => {
        if (studentData.student.id === newGrade.studentId) {
          return {
            ...studentData,
            grades: [newGrade, ...studentData.grades].sort((a, b) => {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              return dateB.getTime() - dateA.getTime();
            })
          };
        }
        return studentData;
      });
      setData({ studentDatas: updatedStudentDatas });
    }
  };

  const handleCloseModal = () => {
    setIsAddGradeModalOpen(false);
    setSelectedStudent(null);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (!task) {
    return <div className="container mx-auto p-4">Načítám úkol...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Informace o úkolu */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{task.title}</h1>
        
        {task.description && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Popis</h2>
            <p className="text-gray-600">{task.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {task.keywords && (
            <div>
              <strong className="text-gray-700">Klíčová slova:</strong>
              <span className="ml-2 text-gray-600">{task.keywords}</span>
            </div>
          )}
          
          {task.minGrade !== null && task.minGrade !== undefined && (
            <div>
              <strong className="text-gray-700">Minimální hodnota:</strong>
              <span className="ml-2 text-gray-600">{task.minGrade}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabulka se studenty a známkami */}
      {!data ? (
        <div className="text-center">Načítám známky...</div>
      ) : data.studentDatas.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Nejsou k dispozici žádné známky pro tento úkol.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Známky studentů</h2>
            <div className="max-w-sm">
              <input
                type="text"
                placeholder="Hledat podle čísla, jména nebo příjmení..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setFilterText('');
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {filteredStudentData && filteredStudentData.length === 0 && filterText.trim() ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Žádní studenti neodpovídají zadaným kritériím.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Číslo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Příjmení
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jméno
                  </th>
                  <th className="px-3 py-3 text-center">
                    {/* Prázdný sloupec pro tlačítko + */}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Známka
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Komentář
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(filteredStudentData || []).map((studentData) => (
                  studentData.grades.length === 0 ? (
                    <tr key={`student-${studentData.student.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {studentData.student.number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {studentData.student.surname || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {studentData.student.name || '-'}
                      </td>
                      <td className="px-3 py-4 text-center">
                        <button 
                          className="inline-flex items-center justify-center w-6 h-6 text-sm font-medium text-white bg-green-600 rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          onClick={() => handleAddGrade(studentData.student)}
                        >
                          +
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={2}>
                        Bez známky
                      </td>
                    </tr>
                  ) : (
                    studentData.grades.map((grade, gradeIndex) => (
                      <tr key={`student-${studentData.student.id}-grade-${grade.id}`} className="hover:bg-gray-50">
                        {gradeIndex === 0 && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" rowSpan={studentData.grades.length}>
                            {studentData.student.number}
                          </td>
                        )}
                        {gradeIndex === 0 && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" rowSpan={studentData.grades.length}>
                            {studentData.student.surname || '-'}
                          </td>
                        )}
                        {gradeIndex === 0 && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" rowSpan={studentData.grades.length}>
                            {studentData.student.name || '-'}
                          </td>
                        )}
                        {gradeIndex === 0 && (
                          <td className="px-3 py-4 text-center" rowSpan={studentData.grades.length}>
                            <button 
                              className="inline-flex items-center justify-center w-6 h-6 text-sm font-medium text-white bg-green-600 rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              onClick={() => handleAddGrade(studentData.student)}
                            >
                              +
                            </button>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(grade.date).toLocaleString('cs-CZ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            grade.value >= 60 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {grade.value}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {grade.comment || '-'}
                        </td>
                      </tr>
                    ))
                  )
                ))}
              </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Add Grade Modal */}
      <AddGradeModal
        isOpen={isAddGradeModalOpen}
        onClose={handleCloseModal}
        student={selectedStudent}
        taskId={id}
        onGradeAdded={handleGradeAdded}
      />
    </div>
  );
}
