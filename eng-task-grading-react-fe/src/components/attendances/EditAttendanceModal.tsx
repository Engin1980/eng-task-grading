import { useState } from 'react';
import type { AttendanceDto, AttendanceUpdateDto } from '../../model/attendance-dto';
import { AppDialog } from '../../ui/AppDialog';
import { AttendanceEditor, type AttendanceEditorData } from '../../ui/editors/AttendanceEditor';
import toast from 'react-hot-toast';

interface EditAttendanceModalProps {
  isOpen: boolean;
  attendance: AttendanceDto;
  onSubmit: (data: AttendanceUpdateDto) => void;
  onClose: () => void;
}

export function EditAttendanceModal(props: EditAttendanceModalProps) {
  const cleanData: AttendanceEditorData = { title: props.attendance.title ?? '', minWeight: props.attendance.minWeight };
  const [attendanceEditorData, setAttendanceEditorData] = useState<AttendanceEditorData>(cleanData);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!attendanceEditorData.title.trim()) return;

    setSubmitting(true);
    try {
      const attendanceData: AttendanceUpdateDto = {
        title: attendanceEditorData.title.trim(),
        minWeight: attendanceEditorData.minWeight ?? null
      };

      props.onSubmit(attendanceData);

      toast.success("Docházka byla úspěšně upravena.");
      setAttendanceEditorData(cleanData);
      props.onClose();
    } catch (error) {
      console.error('Error creating attendance:', error);
      toast.error("Chyba při úpravě docházky.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setAttendanceEditorData(cleanData);
      props.onClose();
    }
  };

  return (
    <AppDialog
      isOpen={props.isOpen}
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
