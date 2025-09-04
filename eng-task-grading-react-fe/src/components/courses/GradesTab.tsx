import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useLogger } from '../../hooks/use-logger';
import type { GradeSet, GradeDto } from '../../model/grade-dto';

interface GradesTabProps {
  courseId: string;
}

export function GradesTab({ courseId }: GradesTabProps) {
  const logger = useLogger("GradesTab");
  const navigate = useNavigate();
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
          },
          {
            id: 5,
            title: 'Domácí úkol 2',
            description: 'Pokročilé programování',
            keywords: 'programování, pokročilé',
            minGrade: 65
          },
          {
            id: 6,
            title: 'Laboratorní práce 1',
            description: 'Praktické cvičení',
            keywords: 'laboratoř, praxe',
            minGrade: 55
          },
          {
            id: 7,
            title: 'Test 2',
            description: 'Mezitímní zkouška',
            keywords: 'test, zkouška',
            minGrade: 60
          },
          {
            id: 8,
            title: 'Domácí úkol 3',
            description: 'Databáze a SQL',
            keywords: 'databáze, SQL',
            minGrade: 70
          },
          {
            id: 9,
            title: 'Skupinový projekt',
            description: 'Týmová práce',
            keywords: 'projekt, tým',
            minGrade: 75
          },
          {
            id: 10,
            title: 'Laboratorní práce 2',
            description: 'Pokročilé techniky',
            keywords: 'laboratoř, pokročilé',
            minGrade: 60
          },
          {
            id: 11,
            title: 'Seminární práce',
            description: 'Teoretická analýza',
            keywords: 'seminář, teorie',
            minGrade: 65
          },
          {
            id: 12,
            title: 'Finální test',
            description: 'Závěrečné hodnocení',
            keywords: 'test, finální',
            minGrade: 70
          },
          {
            id: 13,
            title: 'Portfolio',
            description: 'Sbírka prací',
            keywords: 'portfolio, kolekce',
            minGrade: 60
          },
          {
            id: 14,
            title: 'Code Review',
            description: 'Hodnocení kódu',
            keywords: 'kód, review',
            minGrade: 50
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
          { id: 7196, taskId: 1, studentId: 1, value: 21, comment: 'Příště lépe', date: new Date('2025-08-01') },
          { id: 7198, taskId: 1, studentId: 1, value: 14, comment: 'No to jsi zase dosral', date: new Date('2025-08-05') },
          { id: 2, taskId: 2, studentId: 1, value: 78, comment: 'Solidní projekt', date: new Date('2025-09-05') },
          { id: 3, taskId: 3, studentId: 1, value: 92, comment: 'Výborné znalosti', date: new Date('2025-09-10') },
          { id: 15, taskId: 5, studentId: 1, value: 72, comment: 'Dobrý pokrok', date: new Date('2025-09-12') },
          { id: 16, taskId: 7, studentId: 1, value: 68, comment: 'Průměrný výkon', date: new Date('2025-09-18') },
          { id: 17, taskId: 9, studentId: 1, value: 82, comment: 'Dobrá týmová práce', date: new Date('2025-09-22') },
          { id: 18, taskId: 11, studentId: 1, value: 75, comment: 'Solidní analýza', date: new Date('2025-09-25') },

          // Marie Svobodová
          { id: 4, taskId: 1, studentId: 2, value: 95, comment: 'Vynikající práce', date: new Date('2025-09-01') },
          { id: 5, taskId: 2, studentId: 2, value: 88, comment: 'Velmi dobrý projekt', date: new Date('2025-09-05') },
          { id: 6, taskId: 3, studentId: 2, value: 76, comment: 'Dobré znalosti', date: new Date('2025-09-10') },
          { id: 7, taskId: 4, studentId: 2, value: 91, comment: 'Skvělá prezentace', date: new Date('2025-09-15') },
          { id: 19, taskId: 5, studentId: 2, value: 89, comment: 'Výborné řešení', date: new Date('2025-09-12') },
          { id: 20, taskId: 6, studentId: 2, value: 62, comment: 'Základní úroveň', date: new Date('2025-09-16') },
          { id: 21, taskId: 7, studentId: 2, value: 84, comment: 'Dobré znalosti', date: new Date('2025-09-18') },
          { id: 22, taskId: 8, studentId: 2, value: 91, comment: 'Perfektní SQL', date: new Date('2025-09-20') },
          { id: 23, taskId: 10, studentId: 2, value: 78, comment: 'Pokročilé techniky', date: new Date('2025-09-24') },
          { id: 24, taskId: 12, studentId: 2, value: 86, comment: 'Finální úspěch', date: new Date('2025-09-28') },

          // Petr Dvořák
          { id: 8, taskId: 1, studentId: 3, value: 45, comment: 'Nedostatečné', date: new Date('2025-09-01') },
          { id: 9, taskId: 1, studentId: 3, value: 67, comment: 'Opraveno', date: new Date('2025-09-03') },
          { id: 10, taskId: 3, studentId: 3, value: 58, comment: 'Základní znalosti', date: new Date('2025-09-10') },
          { id: 25, taskId: 5, studentId: 3, value: 42, comment: 'Potřebuje zlepšení', date: new Date('2025-09-12') },
          { id: 26, taskId: 6, studentId: 3, value: 71, comment: 'Lepší výkon', date: new Date('2025-09-16') },
          { id: 27, taskId: 8, studentId: 3, value: 55, comment: 'Slabé SQL', date: new Date('2025-09-20') },
          { id: 28, taskId: 13, studentId: 3, value: 64, comment: 'Průměrné portfolio', date: new Date('2025-09-26') },

          // Anna Krásná
          { id: 11, taskId: 1, studentId: 4, value: 72, comment: 'Dobrá práce', date: new Date('2025-09-01') },
          { id: 12, taskId: 2, studentId: 4, value: 84, comment: 'Kvalitní projekt', date: new Date('2025-09-05') },
          { id: 13, taskId: 4, studentId: 4, value: 87, comment: 'Dobrá prezentace', date: new Date('2025-09-15') },
          { id: 29, taskId: 6, studentId: 4, value: 68, comment: 'Solidní práce', date: new Date('2025-09-16') },
          { id: 30, taskId: 7, studentId: 4, value: 79, comment: 'Dobrý test', date: new Date('2025-09-18') },
          { id: 31, taskId: 9, studentId: 4, value: 88, comment: 'Výborná spolupráce', date: new Date('2025-09-22') },
          { id: 32, taskId: 11, studentId: 4, value: 73, comment: 'Dobrá analýza', date: new Date('2025-09-25') },
          { id: 33, taskId: 14, studentId: 4, value: 56, comment: 'Základní review', date: new Date('2025-09-30') },

          // Tomáš Černý - rozšířené známky
          { id: 34, taskId: 3, studentId: 5, value: 48, comment: 'Pod očekáváním', date: new Date('2025-09-10') },
          { id: 35, taskId: 6, studentId: 5, value: 59, comment: 'Těsně pod limitem', date: new Date('2025-09-16') },
          { id: 36, taskId: 8, studentId: 5, value: 73, comment: 'Zlepšující se', date: new Date('2025-09-20') },
          { id: 37, taskId: 10, studentId: 5, value: 61, comment: 'Splněno', date: new Date('2025-09-24') },
          { id: 38, taskId: 12, studentId: 5, value: 74, comment: 'Dobrý finál', date: new Date('2025-09-28') }
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

  // Funkce pro navigaci na detail úkolu
  const handleTaskDetail = (taskId: number) => {
    logger.info("Navigate to task detail", { taskId });
    navigate({ to: `/tasks/${taskId}` });
  };

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

  // Funkce pro výpočet statistik úspěšných úkolů
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
        <table className="w-full bg-white border border-gray-200 rounded-lg table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-48">
                Student
              </th>
              <th className="px-3 py-3 border-b border-gray-200 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-24" style={{left: '192px'}}>
                Úspěšnost
              </th>
              {filteredTasks?.map((task) => (
                <th
                  key={task.id}
                  className="px-2 py-3 border-b border-gray-200 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  title={task.description || task.title}
                >
                  <button
                    onClick={() => handleTaskDetail(task.id)}
                    className="break-words hyphens-auto text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    {task.title}
                  </button>
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
                <td className="px-3 py-4 whitespace-nowrap text-sm text-center sticky left-0 bg-white z-10" style={{left: '192px'}}>
                  {(() => {
                    const stats = getStudentStats(student.id);
                    return (
                      <div className="font-medium">{stats.successful}/{stats.total}</div>
                    );
                  })()}
                </td>
                {filteredTasks?.map((task) => {
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
