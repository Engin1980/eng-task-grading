import { type ChangeEvent } from "react";

export interface AttendanceDayEditorData {
  title: string;
}

interface TaskEditorProps {
  taskData: AttendanceDayEditorData;
  onChange: (data: AttendanceDayEditorData) => void;
}

export function TaskEditor({ taskData, onChange }: TaskEditorProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newTaskData = {
      ...taskData,
      [name]: value,
    };
    onChange(newTaskData);
  };

  return (
    <div className="px-6 py-4">
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Název úkolu<span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          name="title"
          value={taskData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Zadejte název úkolu..."
          required
          autoFocus
        />
      </div>
    </div>
  );
}
