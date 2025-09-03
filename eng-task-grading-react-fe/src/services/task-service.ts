import { apiHttp } from "./api-http";
import { createLogger } from "./log-service";
import type { StudentCreateDto } from "../model/student-dto";
import type { TaskDto, TaskCreateDto } from "../model/task-dto";

const logger = createLogger("TaskService");

export const taskService = {
  async importStudentsToCourse(courseId: string, students: StudentCreateDto[]): Promise<void> {
    logger.info("Importuji studenty do kurzu", { courseId });
    await apiHttp.post(`/course/${courseId}/import`, students);
    logger.info("Studenti byli úspěšně importováni do kurzu", { courseId });
  },

  async getAllByCourseId(courseId: string): Promise<TaskDto[]> {
    logger.info("Stahuji tasky pro kurz " + courseId);
    const { data } = await apiHttp.get<TaskDto[]>(`/task/for-course/${courseId}`);
    logger.info("Tasky staženy");
    return data;
  },

  async create(courseId: string, task: TaskCreateDto): Promise<TaskDto> {
    logger.info("Vytvářím nový task", { courseId, title: task.title });
    const { data } = await apiHttp.post<TaskDto>(`/task/for-course/${courseId}`, task);
    logger.info("Task vytvořen", { taskId: data.id });
    return data;
  },

  async get(taskId: string): Promise<TaskDto> {
    logger.info("Stahuji task " + taskId);
    const { data } = await apiHttp.get<TaskDto>(`/task/${taskId}`);
    logger.info("Task stažen", { taskId });
    return data;
  }
};