namespace EngTaskGradingNetBE.Models.Dtos
{
  public record StudentDto(
    int Id,
    string Number,
    string Email,
    string? Name,
    string? Surname
  );
}
