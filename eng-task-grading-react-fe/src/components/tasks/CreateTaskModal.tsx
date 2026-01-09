import { useState } from 'react';
import type { TaskCreateDto } from '../../model/task-dto';
import { TaskEditor, type TaskEditorData } from '../../ui/editors/TaskEditor';
import toast from 'react-hot-toast';
import { AppDialog } from '../../ui/AppDialog';

interface CreateTaskModalProps {
  isOpen: boolean;
  courseId: number;
  onSubmit: (data: TaskCreateDto) => void;
  onClose: (taskCreated: boolean) => void;
}

export function CreateTaskModal(props: CreateTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskEditorData, setTaskEditorData] = useState<TaskEditorData>({
    title: '',
    description: '',
    keywords: '',
    minGrade: null,
    maxGrade: null,
    aggregation: 'avg'
  });

  const validateTask = () => {
    if (!taskEditorData.title.trim()) {
      toast.error("Název úkolu je povinný.");
      return false;
    } else return true;
  }

  const handleSubmit = async () => {

    if (!validateTask()) return;

    setIsSubmitting(true);

    try {
      const data: TaskCreateDto = {
        courseId: props.courseId,
        title: taskEditorData.title,
        description: taskEditorData.description || null,
        keywords: taskEditorData.keywords || null,
        minGrade: taskEditorData.minGrade || null,
        maxGrade: taskEditorData.maxGrade || null,
        aggregation: taskEditorData.aggregation ?? "last"
      };
      props.onSubmit(data);
      clearData();
      props.onClose(true);
    }
    catch (err) {
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
      maxGrade: null,
      aggregation: 'last'
    });
  }

  const handleClose = () => {
    clearData();
    props.onClose(false);
  };

  return (
    <div>
      <AppDialog
        isOpen={props.isOpen}
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
    </div >
  );
}
