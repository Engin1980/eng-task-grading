namespace EngTaskGradingNetBE.Models.Dtos
{
  public record GradeInsertDto(int TaskId, int StudentId, int Value, string? Comment);
  public record GradeDto(int Id, int StudentId, int Value, string? Comment);
}
