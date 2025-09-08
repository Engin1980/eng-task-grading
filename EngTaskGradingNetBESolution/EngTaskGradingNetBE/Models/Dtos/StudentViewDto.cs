namespace EngTaskGradingNetBE.Models.Dtos
{
  public record StudentViewTokenDto(string AccessToken, string RefreshToken);

  public record StudentViewCourseDto(
    CourseDto Course, 
    List<TaskDto> Tasks, List<AttendanceDto> Attendances, 
    List<GradeDto> Grades, 
    List<AttendanceDaySetRecordDto> AttendanceRecords);
}
