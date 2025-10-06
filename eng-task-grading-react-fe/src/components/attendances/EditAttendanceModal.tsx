import { useState } from 'react';
import type { AttendanceCreateDto, AttendanceDto } from '../../model/attendance-dto';
import { AppDialog } from '../../ui/AppDialog';
import { AttendanceEditor, type AttendanceEditorData } from '../../ui/editors/AttendanceEditor';
import { attendanceService } from '../../services/attendance-service';
import toast from 'react-hot-toast';

interface EditAttendanceModalProps {
  isOpen: boolean;
  attendance: AttendanceDto;
  onClose: (changed: boolean) => void;
}

export function EditAttendanceModal({ isOpen, onClose, attendance }: EditAttendanceModalProps) {
  const cleanData: AttendanceEditorData = { title: attendance.title ?? '', minWeight: attendance.minWeight };
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

      await attendanceService.update(courseId, attendanceData);
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
      confirmButtonText='Upravit'
      title='Úprava docházky'
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <AttendanceEditor
        attendanceData={attendanceEditorData}
        onChange={(data) => setAttendanceEditorData(data)} />
    </AppDialog>
  );
}
