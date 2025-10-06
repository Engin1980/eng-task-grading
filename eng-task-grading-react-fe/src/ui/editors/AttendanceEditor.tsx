import { type ChangeEvent } from "react";

export interface AttendanceEditorData {
  title: string;
  minWeight: number | null;
}

interface AttendanceEditorProps {
  attendanceData: AttendanceEditorData;
  onChange: (data: AttendanceEditorData) => void;
}

export function AttendanceEditor({ attendanceData, onChange }: AttendanceEditorProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newAttendanceData = {
      ...attendanceData,
      [name]: value,
    };
    onChange(newAttendanceData);
  };

  return (
    <div className="px-6 py-4">
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Název docházky<span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          name="title"
          value={attendanceData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Zadejte název docházky..."
          required
          autoFocus
        />
      </div>

      {/* MinWeight */}
      <div className="mb-4">
        <label htmlFor="minWeight" className="block text-sm font-medium text-gray-700 mb-2">
          Minimální váha (nepovinné)
        </label>
        <input
          id="minWeight"
          name="minWeight"
          type="number"
          min="0"
          value={attendanceData.minWeight ?? ''}
          onChange={(e) => onChange({ ...attendanceData, minWeight: e.target.value ? Number(e.target.value) : null })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Zadejte minimální váhu..."
        />
        <p className="mt-1 text-xs text-gray-500">
          Volitelná minimální váha pro úspěšnou docházku
        </p>
      </div>

    </div>
  );
}
