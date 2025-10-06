import { useState } from 'react';
import type { AttendanceCreateDto } from '../../model/attendance-dto';
import { AppDialog } from '../../ui/AppDialog';
import { AttendanceEditor, type AttendanceEditorData } from '../../ui/editors/AttendanceEditor';
import { attendanceService } from '../../services/attendance-service';
import toast from 'react-hot-toast';

interface CreateAttendanceModalProps {
  isOpen: boolean;
  courseId: number;
  onClose: (created:boolean) => void;
}

export function CreateAttendanceModal({ isOpen, onClose, courseId }: CreateAttendanceModalProps) {
  const cleanData: AttendanceEditorData = { title: '', minWeight: null };
  const [attendanceEditorData, setAttendanceEditorData] = useState<AttendanceEditorData>(cleanData);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!attendanceEditorData.title.trim()) return;

    setSubmitting(true);
    try {
      const attendanceData: AttendanceCreateDto = {
        title: attendanceEditorData.title.trim(),
        minWeight: attendanceEditorData.minWeight ?? null
      };

      await attendanceService.create(courseId, attendanceData);
      toast.success("Docházka byla úspěšně vytvořena.");
      setAttendanceEditorData(cleanData);
      onClose(true);
    } catch (error) {
      console.error('Error creating attendance:', error);
      toast.error("Chyba při vytváření docházky.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setAttendanceEditorData(cleanData);
      onClose(false);
    }
  };

  return (
    <AppDialog
      isOpen={isOpen}
      confirmButtonEnabled={() => !submitting && !!attendanceEditorData.title.trim()}
      confirmButtonText='Vytvořit docházku'
      title='Nová docházka'
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <AttendanceEditor
        attendanceData={attendanceEditorData}
        onChange={(data) => setAttendanceEditorData(data)} />
    </AppDialog>
  );
}
