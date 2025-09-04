export interface AttendanceDayDto {
  id: number;
  title: string;
}

export interface AttendanceDayCreateUpdateDto {
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
