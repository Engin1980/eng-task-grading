import { useState } from 'react';
import type { TaskDto, TaskUpdateDto } from '../../model/task-dto';
import { taskService } from '../../services/task-service';
import { TaskEditor, type TaskEditorData } from '../../ui/editors/TaskEditor';
import { AppDialog } from '../../ui/AppDialog';
import { useToast } from '../../hooks/use-toast';
import { useLogger } from '../../hooks/use-logger';

export interface EditTaskModalProps {
  isOpen: boolean;
  task: TaskDto | null;
  onSubmit(data: TaskUpdateDto): Promise<void>;
  onClose: (isUpdated: boolean) => void;
}

export function EditTaskModal({ isOpen, task, onClose }: EditTaskModalProps) {
  const [taskEditorData, setTaskEditorData] = useState<TaskEditorData>({
    title: task?.title ?? '',
    description: task?.description ?? '',
    keywords: task?.keywords ?? '',
    minGrade: task?.minGrade ?? null,
    maxGrade: task?.maxGrade ?? null,
    aggregation: task?.aggregation ?? 'last'
  });
  const tst = useToast();
  const logger = useLogger("EditTaskModal");

  const handleSubmit = async () => {

    if (!task || !taskEditorData.title.trim()) {
      tst.warning(tst.WRN.TASK_TITLE_REQUIRED);
      return;
    }

    try {
      const updateData: TaskUpdateDto = {
        title: taskEditorData.title,
        description: taskEditorData.description,
        keywords: taskEditorData.keywords,
        minGrade: taskEditorData.minGrade,
        maxGrade: taskEditorData.maxGrade,
        aggregation: taskEditorData.aggregation
      };

      await taskService.update(task.id.toString(), updateData);
      tst.success(tst.SUC.ITEM_UPDATED);
      clearData();
      onClose(true);

    } catch (error) {
      logger.error('Error updating task:', error);
      tst.error(error);
    }
  };

  const clearData = () => {
    setTaskEditorData({
      title: '',
      description: '',
      keywords: '',
      minGrade: null,
      maxGrade: null,
      aggregation: 'last'
    });
  }

  const handleClose = () => {
    clearData();
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
