import { type ChangeEvent } from "react";
import { FieldNote } from "../form/FieldNote";
import { FieldLabel } from "../form/FieldLabel";
import { FieldInput } from "../form/FieldInput";

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
        <FieldLabel htmlFor="number" label="Studentské číslo" isMandatory={true} />
        <FieldInput id="number" type="text" name="number" value={studentData.number} onChange={handleChange} placeholder="Zadejte studentské číslo..." required autoFocus />
        <FieldNote>Studentské číslo musí být ve formát Rxxxxx.</FieldNote>
      </div>

      <div className="mb-4">
        <FieldLabel htmlFor="email" label="Studentský email" isMandatory={true} />
        <FieldInput id="email" type="email" name="email" value={studentData.email} onChange={handleChange} placeholder="(vyplní se automaticky dle studentského čísla)" readOnly />
      </div>

      <div className="mb-4">
        <FieldLabel htmlFor="name" label="Jméno" isMandatory={false} />
        <FieldInput id="name" type="text" name="name" value={studentData.name} onChange={handleChange} placeholder="Zadejte jméno studenta..." />
      </div>

      <div className="mb-4">
        <FieldLabel htmlFor="surname" label="Příjmení" isMandatory={false} />
        <FieldInput id="surname" type="text" name="surname" value={studentData.surname} onChange={handleChange} placeholder="Zadejte příjmení studenta..." />
      </div>

      <div className="mb-4">
        <FieldLabel htmlFor="userName" label="Uživatelské jméno (v systému OU)" isMandatory={false} />
        <FieldInput id="userName" type="text" name="userName" value={studentData.userName} onChange={handleChange} placeholder="Zadejte uživatelské jméno studenta..." />
      </div>

      <div className="mb-4">
        <FieldLabel htmlFor="studyProgram" label="Studijní program" isMandatory={false} />
        <FieldInput id="studyProgram" type="text" name="studyProgram" value={studentData.studyProgram} onChange={handleChange} placeholder="Zadejte studijní program studenta..." />
      </div>

      <div className="mb-4">
        <FieldLabel htmlFor="studyForm" label="Studijní forma" isMandatory={false} />
        <FieldInput id="studyForm" type="text" name="studyForm" value={studentData.studyForm} onChange={handleChange} placeholder="Zadejte studijní formu studenta..." />
        <FieldNote>Typicky P pro prezenční, K pro kombinované, D pro distanční.</FieldNote>
      </div>
    </div >
  );
}