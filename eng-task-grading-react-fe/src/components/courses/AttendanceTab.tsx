import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useLogger } from '../../hooks/use-logger';
import { taskService } from '../../services/task-service';
import { CreateTaskModal } from '../tasks';
import type { TaskDto, TaskCreateDto } from '../../model/task-dto';

interface AttendanceTabProps {
  courseId: string;
}

export function AttendanceTab({ courseId }: AttendanceTabProps) {
  const logger = useLogger("AttendanceTab");
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskDto[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div>
      Attendance Tab Content for Course ID: {courseId}
    </div>
  );
}
