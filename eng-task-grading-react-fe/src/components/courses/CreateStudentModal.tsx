import { useState } from "react";
import type { StudentCreateDto } from "../../model/student-dto";
import { AppDialog } from "../../ui/AppDialog";
import { StudentEditor, type StudentEditorData } from "../../ui/editors/StudentEditor";
import { isStudentNumberValid } from "../../types/validations";

interface CreateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (student: StudentCreateDto) => void;
  courseId: string;
}

export function CreateStudentModal(props: CreateStudentModalProps) {
  const [studentEditorData, setStudentEditorData] = useState<StudentEditorData>({
    number: '',
    name: '',
    surname: '',
    userName: '',
    email: '',
    studyProgram: '',
    studyForm: '',
  });

  const handleSubmit = () => {
    props.onSubmit(studentEditorData);
  };

  return (
    <AppDialog
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Přidat studenta"
      confirmButtonText="Vytvořit"
      confirmButtonEnabled={() => isStudentNumberValid(studentEditorData.number)}
      onSubmit={handleSubmit}
    >
      <StudentEditor
        studentData={studentEditorData}
        onChange={setStudentEditorData}
      />
    </AppDialog>
  )
}