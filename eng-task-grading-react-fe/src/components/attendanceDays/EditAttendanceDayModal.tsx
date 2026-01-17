import { useState } from "react";
import type { AttendanceDayDto, AttendanceDayUpdateDto } from "../../model/attendance-dto";
import type { AttendanceDayEditorData } from "../../ui/editors/AttendanceDayEditor";
import { AppDialog } from "../../ui/AppDialog";
import { EditAttendanceDayEditor } from "./EditAttendanceDayEditor";
import { useToast } from "../../hooks/use-toast";

interface EditAttendanceDayModalProps {
  isOpen: boolean;
  attendanceDay: AttendanceDayDto | null;
  onSubmit: (data: AttendanceDayUpdateDto) => void;
  onClose: (dayEdited: boolean) => void;
}

export function EditAttendanceDayModal(props: EditAttendanceDayModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceDayEditorData, setAttendanceDayEditorData] = useState<AttendanceDayEditorData>({
    title: ""
  });
  const tst = useToast();

  const handleSubmit = async () => {

    setIsSubmitting(true);

    const data: AttendanceDayUpdateDto = {
      title: attendanceDayEditorData.title
    };

    try {
      props.onSubmit(data);
      tst.success(tst.SUC.ITEM_UPDATED);
      setAttendanceDayEditorData({ title: "" });
      props.onClose(true);
    } catch (err) {
      tst.error(err);
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setAttendanceDayEditorData({ title: "" });
      props.onClose(false);
    }
  }

  return (
    <AppDialog
      isOpen={props.isOpen}
      onClose={handleClose}
      title="Úprava dne docházky"
      confirmButtonEnabled={() => !!attendanceDayEditorData.title.trim() && !isSubmitting}
      confirmButtonText='Upravit den docházky'
      onSubmit={handleSubmit}
    >

      <EditAttendanceDayEditor data={attendanceDayEditorData} onChange={setAttendanceDayEditorData} />

    </AppDialog>
  );
}