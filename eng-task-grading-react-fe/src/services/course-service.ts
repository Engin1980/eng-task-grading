import { apiHttp } from "./api-http";
import { logService } from "./log-service";
import type { CourseCreateDto, CourseDto } from "../model/course-dto";

export const courseService = {
  /**
   * Stáhne všechny kurzy z backend API
   * @returns Promise s polem CourseOverviewDto
   */
  async getAllCourses(): Promise<CourseDto[]> {
    logService.info("CourseService: Načítám všechny kurzy z API");
    const { data } = await apiHttp.get<CourseDto[]>("/course");
    logService.info(`CourseService: Načteno ${data.length} kurzů`, { count: data.length });
    return data;
  },

  async createCourse(courseData: CourseCreateDto): Promise<CourseDto> {
    logService.info("CourseService: Vytvářím nový kurz", courseData);
    const { data } = await apiHttp.post<CourseDto>("/course", courseData);
    logService.info("CourseService: Kurz byl úspěšně vytvořen", { course: data });
    return data;
  }
};