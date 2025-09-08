namespace EngTaskGradingNetBE.Models.Dtos
{
  public record CourseCreateDto(string Code, string? Name);
  public record CourseDto(int Id, string Code, string? Name, int StudentsCount, int TasksCount, int AttendancesCount);
}
