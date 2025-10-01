namespace EngTaskGradingNetBE.Models.Dtos
{
  public record GradeCreateDto(int TaskId, int StudentId, int Value, string? Comment);
  public record GradeUpdateDto(int Value, string? Comment);
  public record GradeDto(int Id, int TaskId, int StudentId, int Value, DateTime Date, string? Comment);
  public record GradeSetDto(List<TaskDto> Tasks, List<StudentDto> Students, List<GradeDto> Grades);


  public record NewGradeSetDto(List<NewGradeSetTaskDto> Tasks);
  public record NewGradeSetStudentDto(StudentDto Student, List<GradeDto> Grades);
  public record NewGradeSetTaskDto(TaskDto Task, List<NewGradeSetStudentDto> Students);
}
