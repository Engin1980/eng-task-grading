import { createFileRoute } from '@tanstack/react-router'
import { useLogger } from '../../../hooks/use-logger';
import { useEffect, useState } from 'react';
import type { StudentImportAnalysisResultDto, StudentCreateDto, StudentDto } from '../../../model/student-dto';
import { studentService } from '../../../services/student-service';
import { ImportStudentsWizardFirstModal, ImportStudentsWizardSecondModal } from '../../../components/courses';
import { Loading } from '../../../ui/loading';
import { LoadingError } from '../../../ui/loadingError';
import { useLoadingState } from '../../../types/loadingState';
import { CreateStudentModal } from '../../../components/courses/CreateStudentModal';
import { courseService } from '../../../services/course-service';

export const Route = createFileRoute('/courses/$id/students')({
  component: StudentsPage,
})

function StudentsPage() {
  const { id } = Route.useParams()
  const courseId = id;
  const logger = useLogger("StudentsTab");
  const [isImportFirstModalOpen, setIsImportFirstModalOpen] = useState(false);
  const [isImportSecondModalOpen, setIsImportSecondModalOpen] = useState(false);
  const [isCreateStudentModalOpen, setIsCreateStudentModalOpen] = useState(false);
  const [studentAnalysisResult, setStudentAnalysisResult] = useState<StudentImportAnalysisResultDto>();
  const [students, setStudents] = useState<StudentDto[]>([]);
  const ldgState = useLoadingState();
  const [filterText, setFilterText] = useState<string>("");

  // Funkce pro filtrování studentů
  const filteredStudents = students.filter(student => {
    if (!filterText.trim()) return true;

    const searchText = filterText.toLowerCase();
    return (
      student.number.toLowerCase().includes(searchText) ||
      (student.name?.toLowerCase().includes(searchText) ?? false) ||
      (student.surname?.toLowerCase().includes(searchText) ?? false) ||
      (student.userName?.toLowerCase().includes(searchText) ?? false)
    );
  });


  const loadStudents = async () => {
    logger.info("Loading students")
    try {
      ldgState.setLoading();
      const students: StudentDto[] = await studentService.getAllByCourseId(courseId);
      setStudents(students);
      ldgState.setDone();
      logger.info("Students loaded")
    } catch (error) {
      ldgState.setError(error);
      logger.error("Error loading students:", error);
    }
  };

  const handleImportZero = () => {
    logger.info("Import Request Invoked");
    setIsImportFirstModalOpen(true);
  }

  const handleStudentCreate = async (student: StudentCreateDto) => {
    const tmp = [student];
    await courseService.importStudentsToCourse(courseId, tmp);
    await loadStudents();
  }

  const handleAnalyzed = async (data: StudentImportAnalysisResultDto) => {
    setStudentAnalysisResult(data);
    setIsImportFirstModalOpen(false);
    setIsImportSecondModalOpen(true);
  };

  const handleImported = async () => {
    logger.info('Importing students from analysis result', { courseId, studentCount: studentAnalysisResult?.students.length || 0 });
    await loadStudents();
  }

  useEffect(() => {
    loadStudents();
  }, [courseId]);

  if (ldgState.loading) return <Loading message="Načítám studenty..." />;
  if (ldgState.error) return <LoadingError message={ldgState.error} onRetry={loadStudents} />;

  return (
    <div>
      {/* Hlavní řádek s filtrováním a tlačítkem */}
      <div className="flex justify-between items-end mb-6 gap-4">
        <div className="flex-1 max-w-md">
          {students.length > 0 && (
            <input
              id="student-filter"
              type="text"
              placeholder="Hledat podle čísla, jména, příjmení nebo uživatelského jména..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setFilterText('');
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setIsCreateStudentModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
          >
            Vytvořit studenta
          </button>
          <button
            onClick={handleImportZero}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
          >
            Importovat studenty
          </button>
        </div>
      </div>

      <CreateStudentModal
        isOpen={isCreateStudentModalOpen}
        onClose={() => setIsCreateStudentModalOpen(false)}
        onSubmit={handleStudentCreate}
        courseId={courseId}
      />

      <ImportStudentsWizardFirstModal
        isOpen={isImportFirstModalOpen}
        onClose={() => setIsImportFirstModalOpen(false)}
        onAnalyzed={handleAnalyzed}
      />
      <ImportStudentsWizardSecondModal
        isOpen={isImportSecondModalOpen}
        onClose={() => setIsImportSecondModalOpen(false)}
        analysisResult={studentAnalysisResult!}
        courseId={courseId}
        onImported={handleImported}
      />

      {ldgState.loading && <Loading message="Načítám studenty..." />}

      {ldgState.error && <LoadingError message={ldgState.error} onRetry={loadStudents} />}

      {students && students.length === 0 && <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Zatím nejsou přihlášení žádní studenti.</p>
      </div>}

      {filteredStudents && filteredStudents.length === 0 && students && students.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Žádní studenti neodpovídají zadaným kritériím.</p>
        </div>
      )}

      {filteredStudents && filteredStudents.length > 0 &&
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Číslo
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jméno
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Příjmení
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Studijní program
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Forma studia
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.number} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-800 font-medium"
                      onClick={() => {
                        // TODO: Implementovat detail známek studenta
                        console.log('Detail studenta:', student.number);
                      }}
                    >
                      {student.number}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.surname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.studyProgram}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.studyForm}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    </div>
  );
}
