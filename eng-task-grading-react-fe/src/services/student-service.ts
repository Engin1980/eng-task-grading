import { apiHttp } from "./api-http";
import { createLogger } from "./log-service";
import type { StudentImportAnalysisResultDto, StudentCreateDto, StudentDto } from "../model/student-dto";

const logger = createLogger("StudentService");

export const studentService = {

  async analyseForImport(data: string): Promise<StudentImportAnalysisResultDto> {
    logger.info("Analyzing data for import", { data });
    const { data: result } = await apiHttp.post<StudentImportAnalysisResultDto>("/v1/student/analyse-stag-export", data);
    logger.info("Data analysis complete", { result });
    return result;
  },

  async getAllByCourseId(courseId: string): Promise<StudentDto[]> {
    logger.info("Načítám studenty podle kurzu");
    const { data } = await apiHttp.get<StudentDto[]>(`/v1/student/for-course/${courseId}`);
    logger.info("Studenti podle kurzu načteni.");
    return data;
  },

  async create(courseId: string, student: StudentCreateDto): Promise<StudentDto>{
    logger.info("Creating student", { courseId, student });
    const { data } = await apiHttp.post<StudentDto>(`/v1/student/for-course/${courseId}`, student);
    logger.info("Student created", { data });
    return data;
  }
};