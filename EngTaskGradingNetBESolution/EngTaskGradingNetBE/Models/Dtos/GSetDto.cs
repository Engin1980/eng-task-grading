namespace EngTaskGradingNetBE.Models.Dtos;

public record GSetCourse(
  CourseDto Course,
  TaskDto[] Tasks,
  AttendanceDto[] Attendances,
  GSetCourseStudentDto[] Students
);

public record GSetCourseStudentDto(
  StudentDto Student,
  GSetCourseStudentTaskDto[] Tasks,
  GSetCourseStudentAttendanceDto[] Attendances
);

public record GSetCourseStudentTaskDto(
  int TaskId,
  GradeDto[] Grades
);

public record GSetCourseStudentAttendanceDto(
  int AttendanceId,
  double Value
);
