import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useLogger } from '../../hooks/use-logger';
import type { StudentAnalysisResultDto } from '../../model/student-dto';
import { studentService } from '../../services/student-service';

interface ImportStudentsWizardFirstModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyzed: (data: StudentAnalysisResultDto) => void;
}

export function ImportStudentsWizardFirstModal({ isOpen, onClose, onAnalyzed }: ImportStudentsWizardFirstModalProps) {
  const [importText, setImportText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const logger = useLogger("ImportStudentWizardFirstModal");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!importText.trim()) {
      logger.warn('Import text is empty');
      return;
    }

    setIsLoading(true);
    const data :StudentAnalysisResultDto = await studentService.analyseForImport(importText);
    setIsLoading(false);
    onAnalyzed(data);
  };

  const handleCancel = () => {
    setImportText('');
    onClose();
    logger.debug('Import modal cancelled');
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
    </Dialog.Root>
  );
}
