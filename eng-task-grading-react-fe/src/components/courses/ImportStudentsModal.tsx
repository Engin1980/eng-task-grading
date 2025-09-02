import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useLogger } from '../../hooks/use-logger';
import { StudentAnalysisResultModal } from './StudentAnalysisResultModal';
import type { StudentAnalysisResultDto } from '../../model/student-dto';

interface ImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (text: string) => void;
}

export function ImportStudentsModal({ isOpen, onClose, onImport }: ImportStudentsModalProps) {
  const [importText, setImportText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<StudentAnalysisResultDto | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const logger = useLogger("ImportStudentsModal");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!importText.trim()) {
      logger.warn('Import text is empty');
      return;
    }

    try {
      setIsLoading(true);
      logger.info('Starting student import analysis', { textLength: importText.length });
      
      // Simulate analysis with mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      const mockAnalysisResult: StudentAnalysisResultDto = {
        students: [
          {
            number: 'A21N0105P',
            name: 'Pavel',
            surname: 'Novotný',
            userName: 'novop01',
            email: 'pavel.novotny@student.osu.cz',
            studyProgram: 'Informatika',
            studyForm: 'Prezenční'
          },
          {
            number: 'A21N0106P',
            name: 'Tereza',
            surname: 'Svobodová',
            userName: 'svobt01',
            email: 'tereza.svobodova@student.osu.cz',
            studyProgram: 'Informatika',
            studyForm: 'Kombinovaná'
          },
          {
            number: 'A21N0107P',
            name: 'Michal',
            surname: 'Černý',
            userName: 'cernm01',
            email: 'michal.cerny@student.osu.cz',
            studyProgram: 'Informatika',
            studyForm: 'Prezenční'
          }
        ],
        errors: [
          'Řádek 5: Neplatný email formát pro student A21N0108P',
          'Řádek 7: Chybí povinné pole "Studijní program" pro student A21N0109P'
        ]
      };

      setAnalysisResult(mockAnalysisResult);
      setIsAnalysisModalOpen(true);
      
      logger.info('Student import analysis completed', { 
        studentsCount: mockAnalysisResult.students.length,
        errorsCount: mockAnalysisResult.errors.length 
      });
    } catch (error) {
      logger.error('Failed to analyze students import', { error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setImportText('');
    onClose();
    logger.debug('Import modal cancelled');
  };

  const handleAnalysisClose = () => {
    setIsAnalysisModalOpen(false);
    setAnalysisResult(null);
  };

  const handleAnalysisContinue = async () => {
    if (analysisResult) {
      logger.info('Proceeding with final import', { 
        studentsCount: analysisResult.students.length 
      });
      
      // Here you would call the actual import with the analysis result
      await onImport(importText.trim());
      
      // Reset form and close both modals
      setImportText('');
      setAnalysisResult(null);
      setIsAnalysisModalOpen(false);
      onClose();
      
      logger.info('Final student import completed successfully');
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-white/20 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
            Import studentů
          </Dialog.Title>
          
          <Dialog.Description className="text-sm text-gray-600 mb-6">
            Vložte text se seznamem studentů. Seznam studentů získáte z přehledu is-stag.osu.cz, 
            exportem do CSV. CSV obsahuje záhlaví na prvním řádku,  ze kterého se získají klíčová slova
            pro mapování studentů. Vložte zde planý text získaného CSV.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="importText" className="block text-sm font-medium text-gray-700 mb-2">
                Text pro import
              </label>
              <textarea
                id="importText"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Vložte zde text se studenty..."
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-vertical whitespace-nowrap overflow-x-auto"
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Zrušit
              </button>
              <button
                type="submit"
                disabled={isLoading || !importText.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Importuji...' : 'Importovat'}
              </button>
            </div>
          </form>

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

      {/* Analysis Result Modal */}
      <StudentAnalysisResultModal
        isOpen={isAnalysisModalOpen}
        onClose={handleAnalysisClose}
        onContinue={handleAnalysisContinue}
        analysisResult={analysisResult}
      />
    </Dialog.Root>
  );
}
