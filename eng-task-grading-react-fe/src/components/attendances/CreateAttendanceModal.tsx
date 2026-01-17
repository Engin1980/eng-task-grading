import { useState } from 'react';
import type { AttendanceCreateDto } from '../../model/attendance-dto';
import { AppDialog } from '../../ui/AppDialog';
import { AttendanceEditor, type AttendanceEditorData } from '../../ui/editors/AttendanceEditor';
import { useToast } from '../../hooks/use-toast';

interface CreateAttendanceModalProps {
  isOpen: boolean;
  courseId: number;
  onSubmit: (data: AttendanceCreateDto) => void;
  onClose: () => void;
}

export function CreateAttendanceModal(props: CreateAttendanceModalProps) {
  const cleanData: AttendanceEditorData = { title: '', minWeight: null };
  const [attendanceEditorData, setAttendanceEditorData] = useState<AttendanceEditorData>(cleanData);
  const [submitting, setSubmitting] = useState(false);
  const tst = useToast();

  const handleSubmit = async () => {
    if (!attendanceEditorData.title.trim()) return;

    setSubmitting(true);
    try {
      const attendanceData: AttendanceCreateDto = {
        title: attendanceEditorData.title.trim(),
        minWeight: attendanceEditorData.minWeight ?? null
      };

      props.onSubmit(attendanceData);
      tst.success(tst.SUC.ITEM_CREATED);
      setAttendanceEditorData(cleanData);
      props.onClose();
    } catch (error) {
      console.error('Error creating attendance:', error);
      tst.error(error);
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
