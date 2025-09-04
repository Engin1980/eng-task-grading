namespace EngTaskGradingNetBE.Models.Dtos
{
  public record AppLogDto(
    int Id, string? Message, string? MessageTemplate, string? Level, DateTime? TimeStamp, string? Exception, string? Properties);
}