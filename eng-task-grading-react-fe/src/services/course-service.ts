import { apiHttp } from "./api-http";
import { createLogger } from "./log-service";
import type { FinalGradeDto, CourseCreateDto, CourseDto, CourseEditDto, CourseOverviewDto } from "../model/course-dto";
import type { StudentCreateDto } from "../model/student-dto";

const logger = createLogger("CourseService");

export const courseService = {
  /**
   * Stáhne všechny kurzy z backend API
   * @returns Promise s polem CourseOverviewDto
   */
  async getAllCourses(): Promise<CourseDto[]> {
    logger.info("Načítám všechny kurzy z API");
    const { data } = await apiHttp.get<CourseDto[]>("/v1/course");
    logger.info(`Načteno ${data.length} kurzů`, { count: data.length });
    return data;
  },

  async createCourse(courseData: CourseCreateDto): Promise<void> {
    logger.info("Vytvářím nový kurz", courseData);
    const { data } = await apiHttp.post<CourseDto>("/v1/course", courseData);
    logger.info("Kurz byl úspěšně vytvořen", { course: data });
  },

  async update(courseId: string, courseData: CourseEditDto): Promise<void> {
    logger.info("Aktualizuji kurz", { courseId, courseData });
    await apiHttp.patch(`/v1/course/${courseId}`, courseData);
    logger.info("Kurz byl úspěšně aktualizován", { courseId });
  },

  async importStudentsToCourse(courseId: string, students: StudentCreateDto[]): Promise<void> {
    logger.info("Importuji studenty do kurzu", { courseId });
    await apiHttp.post(`/v1/course/${courseId}/import-students`, students);
    logger.info("Studenti byli úspěšně importováni do kurzu", { courseId });
  },

  async get(courseId: string): Promise<CourseDto> {
    logger.info("Stahuji kurz " + courseId);
    const { data } = await apiHttp.get<CourseDto>(`/v1/course/${courseId}`);
    logger.info("Kurz stažen", { courseId });
    return data;
  },

  async getOverview(courseId: string): Promise<CourseOverviewDto> {
    logger.info("Stahuji přehledová data kurzu " + courseId);
    const { data } = await apiHttp.get<CourseOverviewDto>(`/v1/course/${courseId}/overview`);
    logger.info("Přehledová data kurzu stažena", { courseId });
    return data;
  },

  async markFinalGradeAsRecordedAsync(finalGradeId: number): Promise<FinalGradeDto> {
    logger.info("Označuji závěrečnou známku jako zaznamenanou", { finalGradeId });
    const res = await apiHttp.put<FinalGradeDto>(`/v1/course/final-grade/${finalGradeId}/recorded`);
    logger.info("Závěrečná známka byla označena jako zaznamenaná", { finalGradeId });
    return res.data;
  },

  async unmarkFinalGradeAsRecordedAsync(finalGradeId: number): Promise<FinalGradeDto> {
    logger.info("Odznačuji závěrečnou známku jako nezaznamenanou", { finalGradeId });
    const res = await apiHttp.delete<FinalGradeDto>(`/v1/course/final-grade/${finalGradeId}/recorded`);
    logger.info("Závěrečná známka byla odznačena jako nezaznamenaná", { finalGradeId });
    return res.data;
  },

  async addFinalGrade(courseId: number, studentId: number, value: number, comment: string | null): Promise<FinalGradeDto> {
    logger.info("Přidávám závěrečnou známku", { courseId, studentId, value });
    const res = await apiHttp.post<FinalGradeDto>(`/v1/course/${courseId}/final-grade`, {
      studentId,
      value,
      comment
    });
    logger.info("Závěrečná známka byla přidána", { courseId, studentId, value });
    return res.data;
  },

  async updateFinalGrade(finalGradeId: number, value: number, comment: string | null): Promise<FinalGradeDto> {
    logger.info("Upravuji závěrečnou známku", { finalGradeId, value });
    const res = await apiHttp.patch<FinalGradeDto>(`/v1/course/final-grade/${finalGradeId}`, {
      value,
      comment
    });
    logger.info("Závěrečná známka byla aktualizována", { finalGradeId, value, comment });
    return res.data;
  },

  async deleteFinalGradeAsync(finalGradeId: number): Promise<void> {
    logger.info("Mažu závěrečnou známku", { finalGradeId });
    await apiHttp.delete<void>(`/v1/course/final-grade/${finalGradeId}`);
    logger.info("Závěrečná známka byla smazána", { finalGradeId });
  }
};