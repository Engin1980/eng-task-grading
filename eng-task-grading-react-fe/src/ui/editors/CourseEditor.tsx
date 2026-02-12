import { type ChangeEvent } from "react";
import { FieldLabel } from "../form/FieldLabel";
import { FieldInput } from "../form/FieldInput";

export interface CourseEditorData {
  code: string;
  name: string;
  isActive: boolean;
}

interface CourseEditorProps {
  courseData: CourseEditorData;
  onChange: (data: CourseEditorData) => void;
}

export function CourseEditor({ courseData, onChange }: CourseEditorProps) {
  console.log("### CourseEditor render", courseData);
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    const newData = {
      ...courseData,
      [name]: type === 'checkbox' ? checked : value,
    } as unknown as CourseEditorData;
    if (name === "code" && type !== 'checkbox') {
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

      <div className="mb-4 flex items-center space-x-2">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          checked={courseData.isActive}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label className="text-sm font-medium text-gray-700" htmlFor="isActive">Aktivní</label>
      </div>
    </div >
  );
}