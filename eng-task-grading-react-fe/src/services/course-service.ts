import { apiHttp } from "./api-http";
import { createLogger } from "./log-service";
import type { CourseCreateDto, CourseDto } from "../model/course-dto";
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

  async createCourse(courseData: CourseCreateDto): Promise<CourseDto> {
    logger.info("Vytvářím nový kurz", courseData);
    const { data } = await apiHttp.post<CourseDto>("/v1/course", courseData);
    logger.info("Kurz byl úspěšně vytvořen", { course: data });
    return data;
  },

  async importStudentsToCourse(courseId: string, students: StudentCreateDto[]): Promise<void> {
    logger.info("Importuji studenty do kurzu", { courseId });
    await apiHttp.post(`/course/${courseId}/import`, students);
    logger.info("Studenti byli úspěšně importováni do kurzu", { courseId });
  }
};