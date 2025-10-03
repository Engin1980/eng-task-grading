import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useLogger } from '../../hooks/use-logger';
import type { TaskCreateDto } from '../../model/task-dto';
import { taskService } from '../../services/task-service';
import { TaskEditor, type TaskEditorData } from '../../ui/editors/TaskEditor';
import toast from 'react-hot-toast';


interface CreateTaskModalProps {
  isOpen: boolean;
  courseId: number;
  onClose: (isCompleted: boolean) => void;
}

export function CreateTaskModal({ isOpen, onClose, courseId }: CreateTaskModalProps) {
  const logger = useLogger("CreateTaskModal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskEditorData, setTaskEditorData] = useState<TaskEditorData>({
    title: '',
    description: '',
    keywords: '',
    minGrade: null,
    aggregation: 'avg'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskEditorData.title.trim()) {
      toast.error("Název úkolu je povinný.");
      return;
    }

    setIsSubmitting(true);
    logger.info("Submitting new task", taskEditorData);

    try {
      const newTask: TaskCreateDto = {
        courseId: courseId,
        title: taskEditorData.title,
        description: taskEditorData.description || null,
        keywords: taskEditorData.keywords || null,
        minGrade: taskEditorData.minGrade || null,
        aggregation: taskEditorData.aggregation ?? "last"
      };
      const createdTask = await taskService.create(newTask);
      logger.info("Task created successfully", createdTask);
      toast.success("Úkol byl úspěšně vytvořen.");
      clearData();
      onClose(true);
    } catch (err) {
      logger.error("Error creating task", { error: err });
      toast.error("Chyba při vytváření úkolu.");
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
    onClose(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose} >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
            Vytvořit nový úkol
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <TaskEditor
              taskData={taskEditorData}
              onChange={setTaskEditorData} />

            {/* Tlačítka */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Zrušit
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Vytvořit úkol
              </button>
            </div>
          </form>

          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Zavřít"
            >
              <span className="sr-only">Zavřít</span>
              ✕
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root >
  );
}
