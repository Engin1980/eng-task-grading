import type { AttendanceCreateDto, AttendanceDayCreateUpdateDto, AttendanceDto, AttendanceUpdateDto } from "../model/attendance-dto";
import { apiHttp } from "./api-http";

export const attendanceService = {
  getAllByCourseId: async (courseId: number) => {
    const { data } = await apiHttp.get<AttendanceDto[]>(`/v1/attendance/for-course/${courseId}`);
    return data;
  },

  createAttendance: async (courseId: number, attendance: AttendanceCreateDto) => {
    const { data } = await apiHttp.post<AttendanceDto>(`/v1/attendance/for-course/${courseId}`, attendance);
    return data;
  },

  updateAttendance: async (attendanceId: number, attendance: AttendanceUpdateDto) => {
    const { data } = await apiHttp.patch<AttendanceDto>(`/v1/attendance/${attendanceId}`, attendance);
    return data;
  },

  deleteAttendance: async (attendanceId: number) => {
    const { data } = await apiHttp.delete<AttendanceDto>(`/v1/attendance/${attendanceId}`);
    return data;
  },

  createAttendanceDay: async (attendanceId: number, attendanceDay: AttendanceDayCreateUpdateDto) => {
    await apiHttp.post(`/v1/attendance/${attendanceId}/days`, attendanceDay);
  },

  updateAttendanceDay: async (attendanceId: number, attendanceDayId: number, attendanceDay: AttendanceDayCreateUpdateDto) => {
    await apiHttp.patch(`/v1/attendance/${attendanceId}/days/${attendanceDayId}`, attendanceDay);
  },

  deleteAttendanceDay: async (attendanceId: number, attendanceDayId: number) => {
    await apiHttp.delete(`/v1/attendance/${attendanceId}/days/${attendanceDayId}`);
  }
};