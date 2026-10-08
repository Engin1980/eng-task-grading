import { type ChangeEvent } from "react";
import { FieldNote } from "../form/FieldNote";
import { FieldLabel } from "../form/FieldLabel";
import { FieldInput } from "../form/FieldInput";
import { useTranslation } from "react-i18next";

export interface StudentEditorData {
  number: string;
  name: string;
  surname: string;
  userName: string;
  email: string;
  studyProgram: string;
  studyForm: string;
}

interface StudentEditorProps {
  studentData: StudentEditorData;
  onChange: (data: StudentEditorData) => void;
}

export function StudentEditor({ studentData, onChange }: StudentEditorProps) {
  const { t } = useTranslation("courses");
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newStudentData = {
      ...studentData,
      [name]: value,
    };
    if (name === "number") {
      newStudentData.number = value.toUpperCase();
      newStudentData.email = (newStudentData.number + "@student.osu.cz").toLowerCase();
    }
    onChange(newStudentData);
  };

  return (
    <div className="px-6 py-4">
      <div className="mb-4">
        <FieldLabel htmlFor="number" label={t("studentEditor.number")} isMandatory={true} />
        <FieldInput id="number" type="text" name="number" value={studentData.number} onChange={handleChange} placeholder={t("studentEditor.numberPlaceholder")} required autoFocus />
        <FieldNote>{t("studentEditor.numberNote")}</FieldNote>
      </div>

      <div className="mb-4">
        <FieldLabel htmlFor="email" label={t("studentEditor.email")} isMandatory={true} />
        <FieldInput id="email" type="email" name="email" value={studentData.email} onChange={handleChange} placeholder={t("studentEditor.emailPlaceholder")} readOnly />
      </div>

      <div className="mb-4">
        <FieldLabel htmlFor="name" label={t("studentEditor.name")} isMandatory={false} />
        <FieldInput id="name" type="text" name="name" value={studentData.name} onChange={handleChange} placeholder={t("studentEditor.namePlaceholder")} />
      </div>

      <div className="mb-4">
        <FieldLabel htmlFor="surname" label={t("studentEditor.surname")} isMandatory={false} />
        <FieldInput id="surname" type="text" name="surname" value={studentData.surname} onChange={handleChange} placeholder={t("studentEditor.surnamePlaceholder")} />
      </div>

      <div className="mb-4">
        <FieldLabel htmlFor="userName" label={t("studentEditor.userName")} isMandatory={false} />
        <FieldInput id="userName" type="text" name="userName" value={studentData.userName} onChange={handleChange} placeholder={t("studentEditor.userNamePlaceholder")} />
      </div>

      <div className="mb-4">
        <FieldLabel htmlFor="studyProgram" label={t("studentEditor.studyProgram")} isMandatory={false} />
        <FieldInput id="studyProgram" type="text" name="studyProgram" value={studentData.studyProgram} onChange={handleChange} placeholder={t("studentEditor.studyProgramPlaceholder")} />
      </div>

      <div className="mb-4">
        <FieldLabel htmlFor="studyForm" label={t("studentEditor.studyForm")} isMandatory={false} />
        <FieldInput id="studyForm" type="text" name="studyForm" value={studentData.studyForm} onChange={handleChange} placeholder={t("studentEditor.studyFormPlaceholder")} />
        <FieldNote>{t("studentEditor.studyFormNote")}</FieldNote>
      </div>
    </div >
  );
}