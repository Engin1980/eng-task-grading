import type { GradeCreateDto, GradeDto, GradeSet, GradeUpdateDto } from "../model/grade-dto";
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

  async createGrade(grade: GradeCreateDto): Promise<void> {
    await apiHttp.post<GradeDto>("/v1/grade", grade);
  },

  async updateGrade(gradeId: string, grade: GradeUpdateDto): Promise<void> {
    await apiHttp.patch<GradeDto>(`/v1/grade/${gradeId}`, grade);
  },

  async deleteGrade(gradeId: string): Promise<void> {
    await apiHttp.delete(`/v1/grade/${gradeId}`);
  }
}