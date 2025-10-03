namespace EngTaskGradingNetBE.Models.Dtos
{
  public record TaskDto(
          int Id,
          string Title,
          string? Keywords,
          string? Description,
          int? MinGrade,
          string Aggregation
      );

  public record TaskCreateDto(
          string Title,
          int CourseId,
          string? Keywords,
          string? Description,
          int? MinGrade,
          string Aggregation
      );

  public record TaskUpdateDto
  (
    string Title,
    string? Keywords,
    string? Description,
    int? MinGrade,
    string Aggregation
  );
}
