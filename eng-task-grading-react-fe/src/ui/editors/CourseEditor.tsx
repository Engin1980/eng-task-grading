import { type ChangeEvent } from "react";
import { FieldLabel } from "../form/FieldLabel";
import { FieldInput } from "../form/FieldInput";

export interface CourseEditorData {
  code: string;
  name: string;
}

interface CourseEditorProps {
  courseData: CourseEditorData;
  onChange: (data: CourseEditorData) => void;
}

export function CourseEditor({ courseData, onChange }: CourseEditorProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newData = {
      ...courseData,
      [name]: value,
    };
    if (name === "code") {
      newData.code = value.toUpperCase();
    }
    onChange(newData);
  };

  return (
    <div className="px-6 py-4">
      <div className="mb-4">
        <FieldLabel htmlFor="code" label="Kód předmětu" isMandatory={true} />
        <FieldInput id="code" type="text" value={courseData.code} onChange={handleChange} placeholder="Zadejte kód předmětu..." required autoFocus />
      </div>

      <div className="mb-4">
        <FieldLabel htmlFor="name" label="Název předmětu" isMandatory={false} />
        <FieldInput id="name" type="text" value={courseData.name} onChange={handleChange} placeholder="Zadejte název předmětu..." required />
      </div>
    </div >
  );
}