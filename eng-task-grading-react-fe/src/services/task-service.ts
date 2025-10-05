import { apiHttp } from "./api-http";
import { createLogger } from "./log-service";
import type { StudentCreateDto } from "../model/student-dto";
import type { TaskDto, TaskCreateDto, TaskUpdateDto } from "../model/task-dto";

const logger = createLogger("TaskService");

export const taskService = {
  async importStudentsToCourse(courseId: string, students: StudentCreateDto[]): Promise<void> {
    logger.info("Importuji studenty do kurzu", { courseId });
    await apiHttp.post(`/v1/course/${courseId}/import`, students);
    logger.info("Studenti byli úspěšně importováni do kurzu", { courseId });
  },

  async getAllByCourseId(courseId: string): Promise<TaskDto[]> {
    logger.info("Stahuji tasky pro kurz " + courseId);
    const { data } = await apiHttp.get<TaskDto[]>(`/v1/task/for-course/${courseId}`);
    logger.info("Tasky staženy");
    return data;
  },

  async create(task: TaskCreateDto): Promise<void> {
    logger.info("Vytvářím nový task", { title: task.title });
    const { data } = await apiHttp.post<TaskDto>(`/v1/task`, task);
    logger.info("Task vytvořen", { taskId: data.id });
  },

  async get(taskId: string): Promise<TaskDto> {
    logger.info("Stahuji task " + taskId);
    const { data } = await apiHttp.get<TaskDto>(`/v1/task/${taskId}`);
    logger.info("Task stažen", { taskId });
    return data;
  },

  async update(taskId: string, task: Partial<TaskUpdateDto>): Promise<void> {
    logger.info("Aktualizuji task " + taskId, task);
    await apiHttp.patch<TaskDto>(`/v1/task/${taskId}`, task);
    logger.info("Task aktualizován", { taskId });
  },

  async delete(taskId: number): Promise<void> {
    logger.info("Mažu task " + taskId);
    await apiHttp.delete<void>(`/v1/task/${taskId}`);
    logger.info("Task smazán", { taskId });
  }
};