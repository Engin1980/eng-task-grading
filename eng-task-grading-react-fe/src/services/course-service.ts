import { apiHttp } from "./api-http";
import { createLogger } from "./log-service";
import type { CourseCreateDto, CourseDto } from "../model/course-dto";

const logger = createLogger("CourseService");

export const courseService = {
  /**
   * Stáhne všechny kurzy z backend API
   * @returns Promise s polem CourseOverviewDto
   */
  async getAllCourses(): Promise<CourseDto[]> {
    logger.info("Načítám všechny kurzy z API");
    const { data } = await apiHttp.get<CourseDto[]>("/course");
    logger.info(`Načteno ${data.length} kurzů`, { count: data.length });
    return data;
  },

  async createCourse(courseData: CourseCreateDto): Promise<CourseDto> {
    logger.info("Vytvářím nový kurz", courseData);
    const { data } = await apiHttp.post<CourseDto>("/course", courseData);
    logger.info("Kurz byl úspěšně vytvořen", { course: data });
    return data;
  }
};