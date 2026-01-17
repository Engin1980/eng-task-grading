import * as Dialog from '@radix-ui/react-dialog';
import { useLogger } from '../../hooks/use-logger';
import type { StudentCreateDto, StudentImportAnalysisResultDto } from '../../model/student-dto';
import { courseService } from '../../services/course-service';
import { useToast } from '../../hooks/use-toast';

interface ImportStudentsWizardSecondModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: (students: StudentCreateDto[]) => void;
  analysisResult: StudentImportAnalysisResultDto | null;
  courseId: string;
}

export function ImportStudentsWizardSecondModal({
  isOpen,
  onClose,
  onImported,
  analysisResult,
  courseId
}: ImportStudentsWizardSecondModalProps) {
  const logger = useLogger("ImportStudentsWizardSecondModal");
  const tst = useToast();

  const handleDoImport = async () => {
    logger.info("Zahajuji import do kurzu");
    try {
      await courseService.importStudentsToCourse(courseId, analysisResult!.students);
      logger.info("Import do kurzu dokončen");
      onImported(analysisResult!.students);
      tst.success(tst.SUC.STUDENTS_IMPORTED);
      onClose();
    }
    catch {
      tst.error(tst.ERR.STUDENTS_IMPORT_FAILED);
    }
  };

  const handleCancel = () => {
    logger.debug("Analysis result modal cancelled");
    onClose();
  };

  if (!analysisResult) {
    return null;
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-white/20 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
            Výsledek analýzy importu studentů
          </Dialog.Title>

          <Dialog.Description className="text-sm text-gray-600 mb-6">
            Zkontrolujte výsledky analýzy před pokračováním v importu.
          </Dialog.Description>

          <div className="space-y-6">
            {/* Students section */}
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">
                Studenti k importu ({analysisResult.students.length})
              </h3>
              {analysisResult.students.length > 0 ? (
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Číslo
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jméno
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Příjmení
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Program
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Forma
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analysisResult.students.map((student, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {student.number}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {student.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {student.surname}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {student.email}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {student.studyProgram}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {student.studyForm}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 border border-gray-200 rounded-md">
                  Žádní studenti k importu
                </div>
              )}
            </div>

            {/* Errors section */}
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">
                Chyby při analýze ({analysisResult.errors.length})
              </h3>
              {analysisResult.errors.length > 0 ? (
                <div className="max-h-32 overflow-y-auto border border-red-200 rounded-md bg-red-50">
                  <ul className="p-4 space-y-1">
                    {analysisResult.errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-700 flex items-start">
                        <span className="flex-shrink-0 w-4 h-4 mr-2 mt-0.5">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-4 text-green-700 border border-green-200 rounded-md bg-green-50">
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Žádné chyby při analýze
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Zrušit
            </button>
            <button
              type="button"
              onClick={handleDoImport}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Importovat do vybraného kurzu
            </button>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Zavřít"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
