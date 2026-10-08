import { type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

export interface TaskEditorData {
  title: string;
  description: string;
  keywords: string;
  minGrade: number | null;
  maxGrade: number | null;
  aggregation: "min" | "max" | "avg" | "last" | "sum";
}

interface TaskEditorProps {
  taskData: TaskEditorData;
  onChange: (data: TaskEditorData) => void;
}

export function TaskEditor({ taskData, onChange }: TaskEditorProps) {
  const { t } = useTranslation("tasks");
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
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
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {t("editor.title")}<span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          name="title"
          value={taskData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={t("editor.titlePlaceholder")}
          required
          autoFocus
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {t("editor.description")}
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={taskData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={t("editor.descriptionPlaceholder")}
        />
      </div>

      {/* Keywords */}
      <div className="mb-4">
        <label
          htmlFor="keywords"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {t("editor.keywords")}
        </label>
        <input
          id="keywords"
          name="keywords"
          value={taskData.keywords}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={t("editor.keywordsPlaceholder")}
        />
      </div>

      {/* Max Grade */}
      <div className="mb-4">
        <label
          htmlFor="maxGrade"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {t("editor.maxGrade")}
        </label>
        <input
          id="maxGrade"
          name="maxGrade"
          type="number"
          min="0"
          max="1000"
          value={taskData.maxGrade ?? ""}
          onChange={(e) =>
            onChange({
              ...taskData,
              maxGrade: e.target.value ? Number(e.target.value) : null,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={t("editor.maxGradePlaceholder")}
        />
      </div>

      {/* Min Grade */}
      <div className="mb-4">
        <label
          htmlFor="minGrade"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {t("editor.minGrade")}
        </label>
        <input
          id="minGrade"
          name="minGrade"
          type="number"
          min="0"
          max="1000"
          value={taskData.minGrade ?? ""}
          onChange={(e) =>
            onChange({
              ...taskData,
              minGrade: e.target.value ? Number(e.target.value) : null,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={t("editor.minGradePlaceholder")}
        />
      </div>

      {/* Aggregation */}
      <div className="mb-4">
        <label
          htmlFor="aggregation"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {t("editor.aggregation")}
        </label>
        <select
          id="aggregation"
          name="aggregation"
          value={taskData.aggregation}
          onChange={(e) =>
            onChange({
              ...taskData,
              aggregation: e.target.value as "min" | "max" | "avg" | "last" | "sum",
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="min">{t("aggregation.min")}</option>
          <option value="max">{t("aggregation.max")}</option>
          <option value="avg">{t("aggregation.avg")}</option>
          <option value="last">{t("aggregation.last")}</option>
          <option value="sum">{t("aggregation.sum")}</option>
        </select>
      </div>
    </div>
  );
}
