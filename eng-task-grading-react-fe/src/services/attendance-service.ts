import type { AttendanceCreateDto, AttendanceDayCreateDto, AttendanceDaySelfSignCreateDto, AttendanceDaySelfSignSetDto, AttendanceDaySetDto, AttendanceDayUpdateDto, AttendanceDto, AttendanceRecordDayByStudentCreate, AttendanceRecordDto, AttendanceSetDto, AttendanceUpdateDto, AttendanceValueDto } from "../model/attendance-dto";
import type { StudentAnalysisResultDto, StudentDto } from "../model/student-dto";
import { apiHttp } from "./api-http";

export const attendanceService = {
  getAllByCourseId: async (courseId: number) => {
    const { data } = await apiHttp.get<AttendanceDto[]>(`/v1/attendance/for-course/${courseId}`);
    return data;
  },

  getById: async (attendanceId: number) => {
    const { data } = await apiHttp.get<AttendanceDto>(`/v1/attendance/${attendanceId}`);
    return data;
  },

  create: async (courseId: number, attendance: AttendanceCreateDto) => {
    const { data } = await apiHttp.post<AttendanceDto>(`/v1/attendance/for-course/${courseId}`, attendance);
    return data;
  },

  update: async (attendanceId: number, attendance: AttendanceUpdateDto) => {
    const { data } = await apiHttp.patch<AttendanceDto>(`/v1/attendance/${attendanceId}`, attendance);
    return data;
  },

  delete: async (attendanceId: number) => {
    const { data } = await apiHttp.delete<AttendanceDto>(`/v1/attendance/${attendanceId}`);
    return data;
  },

  createDay: async (attendanceDay: AttendanceDayCreateDto) => {
    await apiHttp.post(`/v1/attendance/days`, attendanceDay);
  },

  updateDay: async (attendanceDayId: number, attendanceDay: AttendanceDayUpdateDto) => {
    await apiHttp.patch(`/v1/attendance/days/${attendanceDayId}`, attendanceDay);
  },

  deleteDay: async (attendanceDayId: number) => {
    await apiHttp.delete(`/v1/attendance/days/${attendanceDayId}`);
  },

  getAttendanceValues: async () => {
    const { data } = await apiHttp.get<AttendanceValueDto[]>('/v1/attendance/values');
    return data;
  },

  getStudentsByDayId: async (attendanceDayId: number) => {
    const { data } = await apiHttp.get<StudentDto[]>(`/v1/attendance/days/${attendanceDayId}/students`);
    return data;
  },

  getRecordsForDay: async (attendanceDayId: string) => {
    const { data } = await apiHttp.get<AttendanceRecordDto[]>(`/v1/attendance/records/for-day/${attendanceDayId}`, {});
    return data;
  },

  setRecord: async (record: AttendanceRecordDto): Promise<AttendanceRecordDto> => {
    const { data } = await apiHttp.post<AttendanceRecordDto>(`/v1/attendance/records`, record);
    return data;
  },

  deleteRecord: async (attendanceRecordId: number) => {
    await apiHttp.delete(`/v1/attendance/records/${attendanceRecordId}`);
  },

  getCourseSet: async (courseId: number) => {
    const { data } = await apiHttp.get<AttendanceSetDto>(`/v1/attendance/for-course/${courseId}/set`);
    return data;
  },

  getCourseSetNew: async (courseId: number) => {
    const { data } = await apiHttp.get<AttendanceSetForTaskDto[]>(`/v1/attendance/for-course/${courseId}/set-new`);
    return data;
  },

  getAttendanceSet: async (attendanceId: number) => {
    const { data } = await apiHttp.get<AttendanceDaySetDto>(`/v1/attendance/${attendanceId}/set`);
    return data;
  },

  getSelfSignSet: async (attendanceDayId: number) => {
    const { data } = await apiHttp.get<AttendanceDaySelfSignSetDto>(`/v1/attendance/self/for-day/${attendanceDayId}`);
    return data;
  },

  setDaySelfSignKey: async (attendanceDayId: number, key: string) => {
    await apiHttp.patch(`/v1/attendance/days/${attendanceDayId}/key`, key);
  },

  deleteDaySelfSignKey: async (attendanceDayId: number) => {
    await apiHttp.delete(`/v1/attendance/days/${attendanceDayId}/key`);
  },

  addSelfStudentRecord: async (attendanceDayId: number, record: AttendanceDaySelfSignCreateDto) => {
    await apiHttp.post(`/v1/attendance/self/for-day/${attendanceDayId}`, record);
  },

  resolveDaySelfSign: async (selfSignId: number, attendanceValueId: number) => {
    await apiHttp.post(`/v1/attendance/self/${selfSignId}`, attendanceValueId);
  },

  analyseForImport: async (attendanceDayId: number, text: string) => {
    const { data } = await apiHttp.post<StudentAnalysisResultDto>('/v1/attendance/analyse-for-import', { attendanceDayId, text });
    return data;
  },

  importAttendanceToDay: async (attendanceDayId: number, attendanceValueId: number, students: StudentDto[]) => {
    const studentIds = students.map(s => +s.id);
    await apiHttp.post(`/v1/attendance/days/${attendanceDayId}/import`, { attendanceValueId, studentIds });
  }
}