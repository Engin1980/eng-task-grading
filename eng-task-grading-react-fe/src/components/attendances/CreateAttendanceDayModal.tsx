import { useState } from 'react';
import type { AttendanceDayCreateDto } from '../../model/attendance-dto';
import { AppDialog } from '../../ui/AppDialog';
import { useToast } from '../../hooks/use-toast';

interface CreateAttendanceDayModalProps {
  isOpen: boolean;
  attendanceId: number;
  onClose: () => void;
  onSubmit: (attendanceDay: AttendanceDayCreateDto) => Promise<void>;
}

export function CreateAttendanceDayModal(props: CreateAttendanceDayModalProps) {
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const tst = useToast();

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const data: AttendanceDayCreateDto = {
        title: title.trim()
      };

      props.onSubmit(data);

      tst.success(tst.SUC.ITEM_CREATED );
      setTitle('');
      props.onClose();
    } catch (error) {
      tst.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setTitle('');
      props.onClose();
    }
  };

  return (
    <AppDialog
      isOpen={props.isOpen}
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
