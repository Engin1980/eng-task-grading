import type { GradeCreateDto, GradeDto, GradeSet } from "../model/grade-dto";
import { apiHttp } from "./api-http"
import { createLogger } from "./log-service";

const logger = createLogger("GradeService");

export const gradeService = {
  async getGradesByTask(taskId: string): Promise<GradeSet> {
    const { data } = await apiHttp.get<GradeSet>(`/v1/grade/for-task/${taskId}`);
    logger.info(`Načteny známky pro úkol ${taskId}`, { count: data.grades.length });
    logger.info(`Grades data: ${JSON.stringify(data)}`);
    return data;
  },

  async getGradesByCourse(courseId: string): Promise<GradeSet> {
    const { data } = await apiHttp.get<GradeSet>(`/v1/grade/for-course/${courseId}`);
    logger.info(`Načteny známky pro kurz ${courseId}`, { count: data.grades.length });
    logger.info(`Grades data: ${JSON.stringify(data)}`);
    return data;
  },

  async createGrade(grade: GradeCreateDto): Promise<GradeDto> {
    const { data } = await apiHttp.post<GradeDto>("/v1/grade", grade);
    return data;
  }
}