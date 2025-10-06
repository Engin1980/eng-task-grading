import type { StudentDto } from "./student-dto";

export interface AttendanceDayDto {
  id: number;
  title: string;
  selfAssignKey?: string;
}

export interface AttendanceDayCreateDto {
  title: string;
}

export interface AttendanceDayUpdateDto {
  title: string;
}

export interface AttendanceDto {
  id: number;
  courseId: number;
  title: string;
  minWeight: number | null;
  days: AttendanceDayDto[];
}

export interface AttendanceCreateDto {
  title: string;
  minWeight: number | null;
}

export interface AttendanceUpdateDto {
  title: string;
  minWeight: number | null;
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

export interface AttendanceSetItemDto {
  attendanceId: number;
  studentId: number;
  value: number;
}

export interface AttendanceSetDto {
  attendances: AttendanceDto[];
  students: StudentDto[];
  items: AttendanceSetItemDto[];
}

export interface NewAttendanceSetForCourseDto {
  attendance: AttendanceDto;
  students: NewAttendanceSetForStudentDto[];
}

export interface NewAttendanceSetForStudentDto {
  studentId: number;
  attendanceDays: AttendanceSetItemDto[];
}

export interface AttendanceDaySetDto {
  students: StudentDto[];
  attendanceDays: AttendanceDayDto[];
  items: AttendanceDaySetRecordDto[];
}

export interface AttendanceDaySetRecordDto {
  id?: number;
  studentId: number;
  attendanceDayId: number;
  attendanceValueTitle: string;
  attendanceValueWeight: number;
}

export interface AttendanceDaySelfSignCreateDto {
  studyNumber: string;
  key: string;
}

export interface AttendanceDaySelfSignSetDto {
  attendanceDayId: number;
  key: string | null;
  selfSigns: AttendanceDaySelfSignDto[];
}

export interface AttendanceDaySelfSignDto {
  id: number;
  student: StudentDto;
  creationDateTime: Date;
  ip: string;
}
