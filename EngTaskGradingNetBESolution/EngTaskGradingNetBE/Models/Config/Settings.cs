namespace EngTaskGradingNetBE.Models.Config
{
  public class AppSettings
  {
    public TokenSettings TokenSettings { get; set; } = new TokenSettings();
    public string FrontEndBaseUrl { get; set; } = "http://localhost:5173";
  }

  public class TokenSettings
  {
    public const string SectionName = "TokenSettings";

    public int StudentLoginTokenLengthBytes { get; set; } = 32;
    public int StudentLoginTokenExpiryMinutes { get; set; } = 15;
    public int StudentAccessTokenExpiryMinutes { get; set; } = 15;
  }
}