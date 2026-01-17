import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useLogger } from '../../../hooks/use-logger';
import { useEffect, useState } from 'react';
import type { TaskCreateDto, TaskDto } from '../../../model/task-dto';
import { taskService } from '../../../services/task-service';
import { CreateTaskModal } from '../../../components/tasks';
import { LoadingError } from '../../../ui/loadingError';
import { useLoadingState } from '../../../types/loadingState';
import { useToast } from '../../../hooks/use-toast';

export const Route = createFileRoute('/courses/$id/tasks')({
  component: TasksPage,
})

function TasksPage() {
  const { id } = Route.useParams();
  const courseId = id;
  const logger = useLogger("TasksTab");
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskDto[]>();
  const ldgState = useLoadingState();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const tst = useToast();

  const loadTasks = async () => {
    logger.info("Loading tasks for course", { courseId });
    ldgState.setLoading();

    try {
      const tasks = await taskService.getAllByCourseId(courseId);
      setTasks(tasks);
      logger.info("Tasks loaded", { taskCount: tasks.length });
      ldgState.setDone();
    } catch (error) {
      logger.error("Failed to load tasks", { error });
      setTasks([]);
      ldgState.setError("Chyba při načítání úkolů");
    }
  };

  const handleDetailTask = (taskId: number) => {
    logger.info("Navigate to task detail", { taskId });
    navigate({ to: `/tasks/${taskId}` });
  };

  const handleCreateTaskSubmit = async (data: TaskCreateDto) => {
    try {
      await taskService.create(data);
      await loadTasks();
      tst.success(tst.SUC.ITEM_CREATED);
    } catch (err) {
      tst.error(err);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [courseId]);

  return (
    <div>
      {/* Hlavička s tlačítkem pro vytvoření úkolu */}
      <div className='flex justify-end mb-6'>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Vytvořit úkol
        </button>
      </div>
      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onSubmit={handleCreateTaskSubmit}
        onClose={() => setIsCreateModalOpen(false)}
        courseId={+courseId}
      />

      {ldgState.loading && <div className="text-center">Načítám úkoly...</div>}

      {ldgState.error && <LoadingError message={ldgState.error} onRetry={loadTasks} />}

      {tasks && tasks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Zatím nejsou vytvořeny žádné úkoly.</p>
        </div>
      )}

      {tasks && tasks.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Název
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Popis
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Klíčová slova
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max. / Min. hodnota
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDetailTask(task.id)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      {task.title}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {task.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {task.keywords || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.maxGrade !== null && task.maxGrade !== undefined ? task.maxGrade : '-'}
                    /
                    {task.minGrade !== null && task.minGrade !== undefined ? task.minGrade : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
