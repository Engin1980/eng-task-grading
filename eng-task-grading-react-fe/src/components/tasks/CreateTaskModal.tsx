import { useState } from 'react';
import { useLogger } from '../../hooks/use-logger';
import type { TaskCreateDto } from '../../model/task-dto';
import { taskService } from '../../services/task-service';
import { TaskEditor, type TaskEditorData } from '../../ui/editors/TaskEditor';
import toast from 'react-hot-toast';
import { AppDialog } from '../../ui/AppDialog';


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

  const handleSubmit = async () => {
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
      return;
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
    <div>
      <AppDialog
        isOpen={isOpen}
        confirmButtonText='Vytvořit úkol'
        title="Vytvořit nový úkol"
        confirmButtonEnabled={() => taskEditorData.title.trim().length > 0 && !isSubmitting}
        onSubmit={handleSubmit}
        onClose={handleClose}
      >
        <TaskEditor
          taskData={taskEditorData}
          onChange={setTaskEditorData} />
      </AppDialog>
    </div>
  );
}
