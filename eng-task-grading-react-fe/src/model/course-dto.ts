import type { AttendanceDto } from "./attendance-dto";
import type { GradeDto } from "./grade-dto";
import type { StudentDto } from "./student-dto";
import type { TaskDto } from "./task-dto";

export interface CourseCreateDto {
  code: string;
  name?: string;
}

export interface CourseEditDto {
  code: string;
  name?: string;
}

export interface CourseDto {
  id: number;
  code: string;
  name?: string;
  studentsCount: number;
  tasksCount: number;
  attendancesCount: number;
}

export interface FinalGradeDto {
  id: number;
  courseId: number;
  studentId: number;
  value: number;
  comment?: string | null;
  recordedDateTime: Date | null;
}

export interface AttendanceResultDto {
  attendanceId: number;
  studentId: number;
  value: number;
}

export interface CourseOverviewDto {
  course: CourseDto;
  students: StudentDto[];
  tasks: TaskDto[];
  grades: GradeDto[];
  attendances: AttendanceDto[];
  attendanceOverview: AttendanceResultDto[];
  finalGrades: FinalGradeDto[];
}