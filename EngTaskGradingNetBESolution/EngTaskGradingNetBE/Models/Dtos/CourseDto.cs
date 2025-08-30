namespace EngTaskGradingNetBE.Models.Dtos
{
  public record CourseDto(
    int Id,
    string Code,
    string? Name,
    List<StudentDto> Students,
    List<TaskDto> Tasks
  );
}
