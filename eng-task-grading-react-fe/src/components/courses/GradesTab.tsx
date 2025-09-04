import { useState, useEffect } from 'react';
import { useLogger } from '../../hooks/use-logger';
import type { GradeSet, GradeDto } from '../../model/grade-dto';
import { gradeService } from '../../services/grade-service';

interface GradesTabProps {
  courseId: string;
}

export function GradesTab({ courseId }: GradesTabProps) {
  const logger = useLogger("GradesTab");
  const [gradeSet, setGradeSet] = useState<GradeSet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [studentFilter, setStudentFilter] = useState<string>("");
  const [taskFilter, setTaskFilter] = useState<string>("");

  // Mock data pro ukázku - bude nahrazeno voláním API
  const loadGradeSet = async () => {
    try {
      setLoading(true);
      
      // Mock data
      const mockGradeSet: GradeSet = {
        tasks: [
          {
            id: 1,
            title: 'Domácí úkol 1',
            description: 'Základy OOP',
            keywords: 'programování, OOP',
            minGrade: 60
          },
          {
            id: 2,
            title: 'Semestrální práce',
            description: 'Větší projekt',
            keywords: 'projekt, aplikace',
            minGrade: 70
          },
          {
            id: 3,
            title: 'Test 1',
            description: 'Teoretické znalosti',
            keywords: 'test, teorie',
            minGrade: 50
          },
          {
            id: 4,
            title: 'Prezentace',
            description: 'Obhajoba projektu',
            keywords: 'prezentace, obhajoba',
            minGrade: 80
          }
        ],
        students: [
          {
            id: 1,
            number: 'A21B0001P',
            name: 'Jan',
            surname: 'Novák',
            userName: 'novakj01',
            email: 'novakj01@fel.cvut.cz',
            studyProgram: 'Informatika',
            studyForm: 'Prezenční'
          },
          {
            id: 2,
            number: 'A21B0002P',
            name: 'Marie',
            surname: 'Svobodová',
            userName: 'svobom02',
            email: 'svobom02@fel.cvut.cz',
            studyProgram: 'Informatika',
            studyForm: 'Prezenční'
          },
          {
            id: 3,
            number: 'A21B0003P',
            name: 'Petr',
            surname: 'Dvořák',
            userName: 'dvorap03',
            email: 'dvorap03@fel.cvut.cz',
            studyProgram: 'Informatika',
            studyForm: 'Kombinované'
          },
          {
            id: 4,
            number: 'A21B0004P',
            name: 'Anna',
            surname: 'Krásná',
            userName: 'krasna04',
            email: 'krasna04@fel.cvut.cz',
            studyProgram: 'Informatika',
            studyForm: 'Prezenční'
          },
          {
            id: 5,
            number: 'A21B0005P',
            name: 'Tomáš',
            surname: 'Černý',
            userName: 'cernyto05',
            email: 'cernyto05@fel.cvut.cz',
            studyProgram: 'Informatika',
            studyForm: 'Kombinované'
          }
        ],
        grades: [
          // Jan Novák
          { id: 1, taskId: 1, studentId: 1, value: 85, comment: 'Velmi dobrá práce', date: new Date('2025-09-01') },
          { id: 2, taskId: 2, studentId: 1, value: 78, comment: 'Solidní projekt', date: new Date('2025-09-05') },
          { id: 3, taskId: 3, studentId: 1, value: 92, comment: 'Výborné znalosti', date: new Date('2025-09-10') },
          
          // Marie Svobodová
          { id: 4, taskId: 1, studentId: 2, value: 95, comment: 'Vynikající práce', date: new Date('2025-09-01') },
          { id: 5, taskId: 2, studentId: 2, value: 88, comment: 'Velmi dobrý projekt', date: new Date('2025-09-05') },
          { id: 6, taskId: 3, studentId: 2, value: 76, comment: 'Dobré znalosti', date: new Date('2025-09-10') },
          { id: 7, taskId: 4, studentId: 2, value: 91, comment: 'Skvělá prezentace', date: new Date('2025-09-15') },
          
          // Petr Dvořák
          { id: 8, taskId: 1, studentId: 3, value: 45, comment: 'Nedostatečné', date: new Date('2025-09-01') },
          { id: 9, taskId: 1, studentId: 3, value: 67, comment: 'Opraveno', date: new Date('2025-09-03') },
          { id: 10, taskId: 3, studentId: 3, value: 58, comment: 'Základní znalosti', date: new Date('2025-09-10') },
          
          // Anna Krásná
          { id: 11, taskId: 1, studentId: 4, value: 72, comment: 'Dobrá práce', date: new Date('2025-09-01') },
          { id: 12, taskId: 2, studentId: 4, value: 84, comment: 'Kvalitní projekt', date: new Date('2025-09-05') },
          { id: 13, taskId: 4, studentId: 4, value: 87, comment: 'Dobrá prezentace', date: new Date('2025-09-15') },
          
          // Tomáš Černý - žádné známky zatím
        ]
      };
      
      setGradeSet(mockGradeSet);
      
      // TODO: Nahradit mock data skutečným API voláním:
      // const gradeSetData = await gradeService.getGradesByCourse(courseId);
      // setGradeSet(gradeSetData);
    } catch (error) {
      logger.error('Error loading grades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGradeSet();
  }, [courseId]);

  // Funkce pro filtrování studentů
  const filteredStudents = gradeSet?.students.filter(student => {
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

  // Funkce pro získání známky pro konkrétního studenta a task
  const getGradeForStudentAndTask = (studentId: number, taskId: number): GradeDto | null => {
    if (!gradeSet) return null;
    
    // Najdeme nejvyšší známku pro danou kombinaci studenta a tasku
    const studentGrades = gradeSet.grades.filter(
      grade => grade.studentId === studentId && grade.taskId === taskId
    );
    
    if (studentGrades.length === 0) return null;
    
    // Seřadíme podle hodnoty sestupně a vrátíme nejvyšší
    return studentGrades.sort((a, b) => b.value - a.value)[0];
  };

  // Funkce pro barevné označení známek
  const getGradeColor = (value: number, minGrade: number) => {
    if (value >= 90) return 'bg-green-100 text-green-800';
    if (value >= 80) return 'bg-blue-100 text-blue-800';
    if (value >= 70) return 'bg-yellow-100 text-yellow-800';
    if (value >= minGrade) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
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
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                Student
              </th>
              {filteredTasks?.map((task) => (
                <th 
                  key={task.id} 
                  className="px-3 py-3 border-b border-gray-200 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]"
                  title={task.description || task.title}
                >
                  <div className="truncate">{task.title}</div>
                  {task.minGrade !== null && task.minGrade !== undefined && (
                    <div className="text-xs text-gray-400 font-normal">Min: {task.minGrade}</div>
                  )}
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
                {filteredTasks?.map((task) => {
                  const grade = getGradeForStudentAndTask(student.id, task.id);
                  return (
                    <td key={`${student.id}-${task.id}`} className="px-3 py-4 text-center text-sm">
                      {grade ? (
                        <div className="space-y-1">
                          <span 
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(grade.value, task.minGrade || 0)}`}
                            title={grade.comment || undefined}
                          >
                            {grade.value}
                          </span>
                          <div className="text-xs text-gray-400">
                            {new Date(grade.date).toLocaleDateString('cs-CZ')}
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
