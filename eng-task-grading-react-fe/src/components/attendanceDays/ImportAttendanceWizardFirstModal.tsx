import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useLogger } from '../../hooks/use-logger';
import type { StudentAnalysisResultDto, StudentAnalysisResultDtoWithAttendanceValue } from '../../model/student-dto';
import { attendanceService } from '../../services/attendance-service';
import toast from 'react-hot-toast';
import type { AttendanceValueDto } from '../../model/attendance-dto';
import { AttendanceValueLabelBlock } from '../../ui/attendanceValueLabelBlock';
import { AttendanceValueLabel } from '../../ui/attendanceValueLabel';

interface ImportAttendanceWizardFirstModalProps {
  isOpen: boolean;
  attendanceDayId: number;
  onClose: () => void;
  onAnalyzed: (result: StudentAnalysisResultDtoWithAttendanceValue) => void;
}

export function ImportAttendanceWizardFirstModal({ isOpen, onClose, onAnalyzed, attendanceDayId }: ImportAttendanceWizardFirstModalProps) {
  const [importText, setImportText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceValues, setAttendanceValues] = useState<AttendanceValueDto[] | null>(null);
  const [selectedAttendanceValueId, setSelectedAttendanceValueId] = useState<number | null>(null);
  const logger = useLogger("ImportAttendanceWizardFirstModal");

  const loadData = async () => {
    const vals = await attendanceService.getAttendanceValues();
    setAttendanceValues(vals);
    if (vals.length > 0) setSelectedAttendanceValueId(vals[0].id);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!importText.trim()) {
      logger.warn('Import text is empty');
      return;
    }

    setIsLoading(true);
    try {
      const data: StudentAnalysisResultDto = await attendanceService.analyseForImport(attendanceDayId, importText);
      const selectedAttendanceValue = attendanceValues?.find(av => av.id === selectedAttendanceValueId);
      const result: StudentAnalysisResultDtoWithAttendanceValue = {
        result: data,
        attendanceValue: selectedAttendanceValue!,
      };
      logger.info('Text pro import docházky byl analyzován', { data: result });
      setImportText('');
      setSelectedAttendanceValueId(null);
      onAnalyzed(result);
    } catch {
      toast.error('Chyba při analýze textu pro import docházky.');
    }
    setIsLoading(false);
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
            Import docházky podle osobních studentských čísel
          </Dialog.Title>

          <Dialog.Description className="text-sm text-gray-600 mb-6">
            Vložte text seznamem osobních studentských čísel. Mohou a nemusí mít znakový prefix. Odděljte mezerou, čárkou, středníkem.
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
                placeholder="Zde vložte osobní čísla oddělená mezerou, čárkou nebo středníkem..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-vertical whitespace-nowrap overflow-x-auto"
                disabled={isLoading}
              />
            </div>

            <div>
              {attendanceValues && attendanceValues.length > 0 ? (
                <AttendanceValueLabelBlock>
                  {/* Zobraz všechny dostupné attendance values */}
                  {attendanceValues.map((attendanceValue) => {
                    const isSelected = selectedAttendanceValueId === attendanceValue.id;
                    return (
                      <AttendanceValueLabel
                        attendanceValue={attendanceValue}
                        isSelected={isSelected}
                        key={attendanceValue.id}
                        onClick={() => setSelectedAttendanceValueId(attendanceValue.id) } />
                    );
                  })}
                </AttendanceValueLabelBlock>
              ) : (
                <p className="mt-2 text-sm text-gray-500">Žádné hodnoty pro docházku nebyly nalezeny.</p>
              )}
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
    </Dialog.Root >
  );
}
