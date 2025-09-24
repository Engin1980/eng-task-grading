namespace EngTaskGradingNetBE.Models.Dtos
{
  public record AuthorizedDto(TokensDto Tokens, TeacherDto Teacher);

  public record TokensDto(string AccessToken, string RefreshToken);
}
