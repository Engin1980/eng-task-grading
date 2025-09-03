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
      <div className='flex justify-end mb-6'>
        <button
          onClick={handleImportZero}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Importovat studenty
        </button>
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
      </div>

      {loading && <div className="text-center">Načítám studenty...</div>}

      {students && students.length === 0 && <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Zatím nejsou přihlášení žádní studenti.</p>
      </div>}

      {students && students.length != 0 &&
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
              {students.map((student) => (
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
