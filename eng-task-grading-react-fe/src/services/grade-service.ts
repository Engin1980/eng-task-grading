import type { GradeSet } from "../model/grade-dto";
import { apiHttp } from "./api-http"

export const gradeService = {

  async getGradesByTask(taskId: string): Promise<GradeSet> {
    const { data } = await apiHttp.get<GradeSet>(`/grade/for-task/${taskId}`);
    return data;
  },

  async getGradesByCourse(courseId: string): Promise<GradeSet> {
    const { data } = await apiHttp.get<GradeSet>(`/grade/for-course/${courseId}`);
    return data;
  }
}