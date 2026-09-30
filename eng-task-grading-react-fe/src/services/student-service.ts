import { apiHttp } from "./api-http";
import { createLogger } from "./log-service";
import type { StudentImportAnalysisResultDto, StudentCreateDto, StudentDto, CourseStudentDto } from "../model/student-dto";

const logger = createLogger("StudentService");

export const studentService = {

  async analyseForImport(data: string): Promise<StudentImportAnalysisResultDto> {
    logger.info("Analyzing data for import", { data });
    const { data: result } = await apiHttp.post<StudentImportAnalysisResultDto>("/v1/student/analyse-stag-export", data);
    logger.info("Data analysis complete", { result });
    return result;
  },

  async getAllByCourseId(courseId: string): Promise<CourseStudentDto[]> {
    logger.info("Načítám studenty podle kurzu");
    const { data } = await apiHttp.get<CourseStudentDto[]>(`/v1/student/for-course/${courseId}`);
    logger.info("Studenti podle kurzu načteni.");
    return data;
  },

  async updateStudyGroup(courseId: string, studentId: number, studyGroup: string): Promise<CourseStudentDto> {
    logger.info("Updating study group", { courseId, studentId, studyGroup });
    const { data } = await apiHttp.put<CourseStudentDto>(`/v1/student/for-course/${courseId}/${studentId}/study-group`, { studyGroup });
    logger.info("Study group updated", { data });
    return data;
  },

  async create(courseId: string, student: StudentCreateDto): Promise<StudentDto>{
    logger.info("Creating student", { courseId, student });
    const { data } = await apiHttp.post<StudentDto>(`/v1/student/for-course/${courseId}`, student);
    logger.info("Student created", { data });
    return data;
  }
};