import { type ChangeEvent } from "react";

export interface TaskEditorData {
  title: string;
  description: string;
  keywords: string;
  minGrade: number | null;
  maxGrade: number | null;
  aggregation: 'min' | 'max' | 'avg' | 'last';
}

interface TaskEditorProps {
  taskData: TaskEditorData;
  onChange: (data: TaskEditorData) => void;
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
      {/* Title */}
      {/* New grade value */}
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

      {/* Description */}
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Popis
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={taskData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Zadejte popis úkolu..."
        />
      </div>

      {/* Keywords */}
      <div className="mb-4">
        <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
          Klíčová slova
        </label>
        <input
          id="keywords"
          name="keywords"
          value={taskData.keywords}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Zadejte klíčová slova úkolu..."
        />
      </div>

      {/* Max Grade */}
      <div className="mb-4">
        <label htmlFor="maxGrade" className="block text-sm font-medium text-gray-700 mb-2">
          Maximální známka (0-1000)
        </label>
        <input
          id="maxGrade"
          name="maxGrade"
          type="number"
          min="0"
          max="1000"
          value={taskData.maxGrade ?? ''}
          onChange={(e) => onChange({ ...taskData, maxGrade: e.target.value ? Number(e.target.value) : null })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Zadejte maximální známku..."
        />
      </div>

      {/* Min Grade */}
      <div className="mb-4">
        <label htmlFor="minGrade" className="block text-sm font-medium text-gray-700 mb-2">
          Minimální úspěšná známka (0-1000)
        </label>
        <input
          id="minGrade"
          name="minGrade"
          type="number"
          min="0"
          max="1000"
          value={taskData.minGrade ?? ''}
          onChange={(e) => onChange({ ...taskData, minGrade: e.target.value ? Number(e.target.value) : null })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Zadejte minimální známku pro úspěch..."
        />
      </div>

      {/* Aggregation */}
      <div className="mb-4">
        <label htmlFor="aggregation" className="block text-sm font-medium text-gray-700 mb-2">
          Agregace známky
        </label>
        <select
          id="aggregation"
          name="aggregation"
          value={taskData.aggregation}
          onChange={(e) => onChange({ ...taskData, aggregation: e.target.value as 'min' | 'max' | 'avg' | 'last' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="min">Minimum</option>
          <option value="max">Maximum</option>
          <option value="avg">Průměr</option>
          <option value="last">Poslední</option>
        </select>
      </div>
    </div>
  );
}
