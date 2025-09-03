namespace EngTaskGradingNetBE.Models.Dtos
{
  public record TaskDto(
          int Id,
          string Title,
          string? Keywords,
          string? Description,
          int? MinGrade
      );

  public record TaskCreateDto(
          string Title,
          string? Keywords,
          string?Description,
          int? MinGrade
      );
}
