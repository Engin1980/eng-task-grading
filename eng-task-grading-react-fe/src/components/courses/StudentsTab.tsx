import { useEffect, useState } from 'react';
import { useLogger } from '../../hooks/use-logger';
import { type StudentDto, type StudentAnalysisResultDto } from '../../model/student-dto';
import { ImportStudentsWizardFirstModal } from './ImportStudentsWizardFirstModal';
import { ImportStudentsWizardSecondModal } from './ImportStudentsWizardSecondModal';
import { studentService } from '../../services/student-service';

interface StudentsTabProps {
  courseId: string;
}

export function StudentsTab({ courseId }: StudentsTabProps) {
  const logger = useLogger("StudentsTab");
  const [isImportFirstModalOpen, setIsImportFirstModalOpen] = useState(false);
  const [isImportSecondModalOpen, setIsImportSecondModalOpen] = useState(false);
  const [studentAnalysisResult, setStudentAnalysisResult] = useState<StudentAnalysisResultDto>();
  const [students, setStudents] = useState<StudentDto[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [filterText, setFilterText] = useState<string>("");

  // Funkce pro filtrování studentů
  const filteredStudents = students?.filter(student => {
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
    setLoading(true)
    const students: StudentDto[] = await studentService.getAllByCourseId(courseId);
    setStudents(students);
    setLoading(false);
    logger.info("Students loaded")
  }

  const handleImportZero = () => {
    logger.info("Import Request Invoked");
    setIsImportFirstModalOpen(true);
  }

  const handleAnalyzed = async (data: StudentAnalysisResultDto) => {
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

  return (
    <div>
      {/* Hlavní řádek s filtrováním a tlačítkem */}
      {students && students.length > 0 && (
        <div className="flex justify-between items-end mb-6 gap-4">
          <div className="flex-1 max-w-md">
            <label htmlFor="student-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Vyhledat studenta
            </label>
            <input
              id="student-filter"
              type="text"
              placeholder="Hledat podle čísla, jména, příjmení nebo uživatelského jména..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
<<<<<<< HEAD
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setFilterText('');
                }
              }}
=======
>>>>>>> 3a89a1973144765bd7a271264d81cc1730f7d1a4
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleImportZero}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
          >
            Importovat studenty
          </button>
        </div>
      )}

      {(!students || students.length === 0) && (
        <div className='flex justify-end mb-6'>
          <button
            onClick={handleImportZero}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Importovat studenty
          </button>
        </div>
      )}

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

      {loading && <div className="text-center">Načítám studenty...</div>}

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
                  Uživatelské jméno
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
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.number} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.surname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.userName}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-800">
                      Detail
                    </button>
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
