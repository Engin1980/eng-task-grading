import type { GradeCreateDto, GradeDto, GradeUpdateDto, NewGradeSetTaskDto } from "../model/grade-dto";
import type { FinalGradeDto } from "../model/gset";
import { apiHttp } from "./api-http"
import { createLogger } from "./log-service";

const logger = createLogger("GradeService");

function reducerMin(grades: GradeDto[]): number {
  return Math.min(...grades.map(g => g.value));
}
function reducerMax(grades: GradeDto[]): number {
  return Math.max(...grades.map(g => g.value));
}
function reducerAvg(grades: GradeDto[]): number {
  return grades.reduce((sum, g) => sum + g.value, 0) / grades.length;
}
function reducerLast(grades: GradeDto[]): number {
  return grades[0].value;
}

export const gradeService = {
  async getGradesByTaskNew(taskId: string): Promise<NewGradeSetTaskDto> {
    const { data } = await apiHttp.get<NewGradeSetTaskDto>(`/v1/grade/for-task/${taskId}/new`);
    logger.info(`Načteny známky pro úkol ${taskId}`);
    return data;
  },

  async createGrade(grade: GradeCreateDto): Promise<GradeDto> {
    const response = await apiHttp.post<GradeDto>("/v1/grade", grade);
    const newGrade: GradeDto = response.data;
    return newGrade;
  },

  async updateGrade(gradeId: string, grade: GradeUpdateDto): Promise<GradeDto> {
    const response = await apiHttp.patch<GradeDto>(`/v1/grade/${gradeId}`, grade);
    return response.data;
  },

  async deleteGrade(gradeId: string): Promise<void> {
    await apiHttp.delete(`/v1/grade/${gradeId}`);
  },

  calculateFinalGradePercentage(finalValue: number | null, minGrade: number | null, maxGrade: number | null): number | null {
    if (finalValue === null || minGrade === null || maxGrade === null) return null;

    // Ošetření extrémních případů a dělení nulou
    if (maxGrade <= 0) return NaN;
    if (maxGrade <= minGrade) return NaN;
    if (finalValue < 0) return NaN;
    if (finalValue >= maxGrade) return 100;

    let percentage: number;

    if (finalValue <= minGrade) {
      percentage = minGrade > 0
        ? (finalValue / minGrade) * 50
        : 50;
    } else {
      const range = maxGrade - minGrade;
      percentage = range > 0
        ? 50 + ((finalValue - minGrade) / range) * 50
        : 100;
    }

    return Math.ceil(percentage);
  },

  evaluateFinalGrade(type: "min" | "max" | "avg" | "last", grades: GradeDto[]): FinalGradeDto | null {
    if (grades.length === 0) return null;

    // order grades by date descending
    const orderedGrades = grades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let value: number;
    let date: Date;
    let ret: FinalGradeDto;
    switch (type.toLowerCase()) {
      case "min":
        value = reducerMin(grades);
        date = grades.find(g => g.value === value)!.date;
        ret = { value, date };
        break;
      case "max":
        value = reducerMax(grades);
        date = grades.find(g => g.value === value)!.date;
        ret = { value, date };
        break;
      case "avg":
        value = reducerAvg(grades);
        date = orderedGrades[0].date;
        ret = { value, date };
        break;
      case "last":
        value = reducerLast(orderedGrades);
        date = orderedGrades[0].date;
        ret = { value, date };
        break;
      default:
        throw new Error(`Unknown final grade evaluation type: ${type}`);
    }

    return ret;
  }
}