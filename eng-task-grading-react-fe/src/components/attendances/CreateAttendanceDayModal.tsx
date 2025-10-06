import { useState } from 'react';
import type { AttendanceDayCreateDto } from '../../model/attendance-dto';
import { AppDialog } from '../../ui/AppDialog';

interface CreateAttendanceDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (attendanceDay: AttendanceDayCreateDto) => Promise<void>;
}

export function CreateAttendanceDayModal({ isOpen, onClose, onSubmit }: CreateAttendanceDayModalProps) {
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim()
      });
      setTitle('');
      onClose();
    } catch (error) {
      console.error('Error creating attendance day:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    onClose();
  };

  return (
    <AppDialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Nový den docházky"
      confirmButtonEnabled={() => !!title.trim() && !submitting}
      confirmButtonText='Vytvořit úkol'
      onSubmit={handleSubmit}
    >

      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Název dne
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Zadejte název dne..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={submitting}
          required
        />
      </div>
    </AppDialog>
  );
}
