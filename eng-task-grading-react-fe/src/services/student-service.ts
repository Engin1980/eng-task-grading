import { apiHttp } from "./api-http";
import { createLogger } from "./log-service";
import type { StudentAnalysisResultDto, StudentDto } from "../model/student-dto";

const logger = createLogger("StudentService");

export const studentService = {

    async analyseForImport(data: string): Promise<StudentAnalysisResultDto> {
        logger.info("Analyzing data for import", { data });
        const { data: result } = await apiHttp.post<StudentAnalysisResultDto>("/v1/student/analyse-stag-export", data);
        logger.info("Data analysis complete", { result });
        return result;
    },

    async getAllByCourseId(courseId: string): Promise<StudentDto[]> {
        logger.info("Načítám studenty podle kurzu");
        const { data } = await apiHttp.get<StudentDto[]>(`/v1/student/for-course/${courseId}`);
        logger.info("Studenti podle kurzu načteni.");
        return data;
    }
};