import type { AttendanceDaySetRecordDto, AttendanceDto } from "./attendance-dto";
import type { CourseDto } from "./course-dto";
import type { GradeDto } from "./grade-dto";
import type { TaskDto } from "./task-dto";

export interface StudentViewLoginDto{
  studentNumber: string;
  captchaToken?: string; // Přidáno pole pro token z Turnstile
}

export interface StudentViewTokenDto {
  accessToken: string;
  refreshToken: string;
}

export interface StudentViewCourseDto{
  course: CourseDto;
  tasks: TaskDto[];
  attendances: AttendanceDto[];
  grades: GradeDto[];
  attendanceRecords: AttendanceDaySetRecordDto[];
}