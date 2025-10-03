import { useState, useEffect } from 'react';
import type { TaskDto, TaskUpdateDto } from '../../model/task-dto';
import { taskService } from '../../services/task-service';
import toast from 'react-hot-toast';
import { TaskEditor, type TaskEditorData } from '../../ui/editors/TaskEditor';

export interface EditTaskModalProps {
  isOpen: boolean;
  task: TaskDto | null;
  onClose: (isUpdated: boolean) => void;
}

export function EditTaskModal({ isOpen, task, onClose }: EditTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskEditorData, setTaskEditorData] = useState<TaskEditorData>({
    title: task?.title ?? '',
    description: task?.description ?? '',
    keywords: task?.keywords ?? '',
    minGrade: task?.minGrade ?? null,
    aggregation: task?.aggregation ?? 'last'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!task || !taskEditorData.title.trim()) {
      toast.error('Název úkolu je povinný.');
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: TaskUpdateDto = {
        title: taskEditorData.title,
        description: taskEditorData.description,
        keywords: taskEditorData.keywords,
        minGrade: taskEditorData.minGrade,
        aggregation: taskEditorData.aggregation
      };

      await taskService.update(task.id.toString(), updateData);

      onClose(true);
      clearData();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Chyba při aktualizaci úkolu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearData = () => {
    setTaskEditorData({
      title: '',
      description: '',
      keywords: '',
      minGrade: null,
      aggregation: 'last'
    });
  }

  const handleClose = () => {
    clearData();
    setIsSubmitting(false);
    onClose(false);
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-white/20 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal panel */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-screen overflow-y-auto">
        <form onSubmit={handleSubmit}>

          <TaskEditor
            taskData={taskEditorData}
            onChange={setTaskEditorData}
          />

          {/* Action buttons */}
          <div className="bg-gray-50 px-6 py-3 flex flex-row-reverse gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Aktualizuji...' : 'Aktualizovat úkol'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Zrušit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
