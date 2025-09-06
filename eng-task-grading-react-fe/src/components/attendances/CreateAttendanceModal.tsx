import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import type { AttendanceCreateDto } from '../../model/attendance-dto';

interface CreateAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (attendance: AttendanceCreateDto) => Promise<void>;
}

export function CreateAttendanceModal({ isOpen, onClose, onSubmit }: CreateAttendanceModalProps) {
  const [title, setTitle] = useState('');
  const [minWeight, setMinWeight] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const attendanceData: AttendanceCreateDto = {
        title: title.trim(),
        days: [], // Zatím vytváříme prázdné attendance bez dnů
      };
      
      // Přidej minWeight pouze pokud je zadaná
      if (minWeight !== '' && minWeight !== null) {
        attendanceData.minWeight = Number(minWeight);
      }
      
      await onSubmit(attendanceData);
      setTitle('');
      setMinWeight('');
      onClose();
    } catch (error) {
      console.error('Error creating attendance:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setTitle('');
      setMinWeight('');
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Nová docházka
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                onClick={handleClose}
                disabled={submitting}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                aria-label="Zavřít"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Název docházky
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Zadejte název docházky..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={submitting}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="minWeight" className="block text-sm font-medium text-gray-700 mb-2">
                Minimální váha (nepovinné)
              </label>
              <input
                type="number"
                id="minWeight"
                value={minWeight}
                onChange={(e) => setMinWeight(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Zadejte minimální váhu..."
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={submitting}
              />
              <p className="mt-1 text-xs text-gray-500">
                Volitelná minimální váha pro úspěšnou docházku
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  Zrušit
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={submitting || !title.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {submitting ? 'Vytváření...' : 'Vytvořit'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
