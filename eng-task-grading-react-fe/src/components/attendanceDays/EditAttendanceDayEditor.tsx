import type { ChangeEvent } from "react";

export interface AttendanceDayEditorData {
  title: string;
}

interface EditAttendanceDayEditorProps {
  data: AttendanceDayEditorData;
  onChange: (data: AttendanceDayEditorData) => void;
}

export function EditAttendanceDayEditor(props: EditAttendanceDayEditorProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newData = {
      ...props.data,
      [name]: value,
    };
    props.onChange(newData);
  };

  return (
    <div className="mb-4">
      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
        Název dne
      </label>
      <input
        id="title"
        type="text"
        name="title"
        value={props.data.title}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Zadejte název dne docházky..."
        required
        autoFocus
      />
    </div>);
}