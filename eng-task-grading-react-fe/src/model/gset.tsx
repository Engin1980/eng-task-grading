import type { AttendanceDto } from "./attendance-dto";
import type { CourseDto } from "./course-dto";
import type { GradeDto } from "./grade-dto";
import type { StudentDto } from "./student-dto";
import type { TaskDto } from "./task-dto";

export interface GSetCourseDto {
  course: CourseDto;
  tasks: TaskDto[];
  attendances: AttendanceDto[];
  students: GSetCourseStudentDto[];
}

export interface GSetCourseStudentDto {
  student: StudentDto;
  tasks: GSetCourseStudentTaskDto[];
  attendances: GSetCourseStudentAttendanceDto[];
}

export interface GSetCourseStudentTaskDto {
  taskId: number;
  grades: GradeDto[];
  final: FinalGradeDto | null;
}

export interface FinalGradeDto {
  value: number;
  date: Date;
}

export interface GSetCourseStudentAttendanceDto {
  attendanceId: number;
  value: number;
}