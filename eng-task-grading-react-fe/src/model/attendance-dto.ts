import type { StudentDto } from "./student-dto";

export interface AttendanceDayDto {
  id: number;
  title: string;
}

export interface AttendanceDayCreateDto {
  attendanceId: number;
  title: string;
}

export interface AttendanceDayUpdateDto {
  title: string;
}

export interface AttendanceDto {
  id: number;
  title: string;
  days: AttendanceDayDto[];
}

export interface AttendanceCreateDto {
  title: string;
  days: AttendanceDayDto[];
}

export interface AttendanceUpdateDto {
  title: string;
}

export interface AttendanceRecordDto {
  id?: number;
  studentId: number;
  attendanceDayId: number;
  attendanceValueId: number;
}

export interface AttendanceValueDto {
  id: number;
  code: string;
  weight: number;
  title: string;
}

export interface AttendanceSetItemDto{
  attendanceId: number;
  studentId: number;
  value: number;
}

export interface AttendanceSetDto{
  attendances: AttendanceDto[];
  students: StudentDto[];
  items: AttendanceSetItemDto[];
}