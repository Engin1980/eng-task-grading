import { useState } from 'react';
import type { TaskDto, TaskUpdateDto } from '../../model/task-dto';
import { taskService } from '../../services/task-service';
import toast from 'react-hot-toast';
import { TaskEditor, type TaskEditorData } from '../../ui/editors/TaskEditor';
import { AppDialog } from '../../ui/AppDialog';

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

  const handleSubmit = async () => {

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
      toast.success('Úkol byl úspěšně aktualizován.');
      clearData();
      onClose(true);

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
    <AppDialog
      isOpen={isOpen}
      title="Upravit úkol"
      confirmButtonText='Aktualizovat úkol'
      confirmButtonEnabled={() => !!taskEditorData.title.trim()}
      onSubmit={handleSubmit}
      onClose={handleClose} >
      <TaskEditor
        taskData={taskEditorData}
        onChange={setTaskEditorData}
      />
    </AppDialog>
  );
}
