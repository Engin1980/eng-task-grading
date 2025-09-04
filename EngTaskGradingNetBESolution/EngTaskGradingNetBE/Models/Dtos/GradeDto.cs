namespace EngTaskGradingNetBE.Models.Dtos
{
  public record GradeCreateDto(int TaskId, int StudentId, int Value, string? Comment);
  public record GradeDto(int Id, int TaskId, int GradeId, int Value, DateTime Date, string? Comment);
  public record GradeSet(List<TaskDto> Tasks, List<StudentDto> Students, List<GradeDto> Grades);
}
