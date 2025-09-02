import { apiHttp } from "./api-http";
import { logService } from "./log-service";
import type { CourseOverviewDto } from "../model/course-overview-dto";

export const courseService = {
  /**
   * Stáhne všechny kurzy z backend API
   * @returns Promise s polem CourseOverviewDto
   */
  async getAllCourses(): Promise<CourseOverviewDto[]> {
    logService.info("CourseService: Načítám všechny kurzy z API");
    const { data } = await apiHttp.get<CourseOverviewDto[]>("/course");
    //const data : CourseOverviewDto[] =  [];
    logService.info(`CourseService: Načteno ${data.length} kurzů`, { count: data.length });
    return data;
  }
};