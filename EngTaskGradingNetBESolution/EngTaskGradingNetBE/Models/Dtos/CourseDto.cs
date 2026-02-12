namespace EngTaskGradingNetBE.Models.Dtos
{
  public record CourseCreateDto(string Code, string? Name);
  public record CourseUpdateDto(string Code, string? Name, bool IsActive);
  public record CourseDto(int Id, string Code, string? Name, bool IsActive, int StudentsCount, int TasksCount, int AttendancesCount);
  public record CourseOverviewDto(
    CourseDto Course,
    StudentDto[] Students,
    TaskDto[] Tasks,
    GradeDto[] Grades,
    AttendanceDto[] Attendances,
    AttendanceResultDto[] AttendanceOverview,
    FinalGradeDto[] FinalGrades
    );
  public record FinalGradeDto(
    int Id,
    int CourseId,
    int StudentId,
    int Value,
    string? Comment,
    DateTime? RecordedDateTime);
}
