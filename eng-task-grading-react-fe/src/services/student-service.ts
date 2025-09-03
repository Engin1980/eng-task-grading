import { apiHttp } from "./api-http";
import { createLogger } from "./log-service";
import type { StudentAnalysisResultDto, StudentDto } from "../model/student-dto";

const logger = createLogger("StudentService");

export const studentService = {

    async analyseForImport(data: string): Promise<StudentAnalysisResultDto> {
        logger.info("Analyzing data for import", { data });
        const { data: result } = await apiHttp.post<StudentAnalysisResultDto>("/student/analyse-stag-export", data);
        logger.info("Data analysis complete", { result });
        return result;
    },

    async getAllByCourseId(courseId: string): Promise<StudentDto[]> {
        logger.info("Načítám studenty podle kurzu");
        const { data } = await apiHttp.get<StudentDto[]>(`/student/by-course/${courseId}`);
        logger.info("Studenti podle kurzu načteni.");
        return data;
    }

    // async getAllCourses(): Promise<CourseDto[]> {
    //     logger.info("Načítám všechny kurzy z API");
    //     const { data } = await apiHttp.get<CourseDto[]>("/course");
    //     logger.info(`Načteno ${data.length} kurzů`, { count: data.length });
    //     return data;
    // },

    // async createCourse(courseData: CourseCreateDto): Promise<CourseDto> {
    //     logger.info("Vytvářím nový kurz", courseData);
    //     const { data } = await apiHttp.post<CourseDto>("/course", courseData);
    //     logger.info("Kurz byl úspěšně vytvořen", { course: data });
    //     return data;
    // }
};