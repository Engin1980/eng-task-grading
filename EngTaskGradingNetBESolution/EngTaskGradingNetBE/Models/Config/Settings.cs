namespace EngTaskGradingNetBE.Models.Config
{
  public class AppSettings
  {
    public TokenSettings Token { get; set; } = new TokenSettings();
    public CloudFlareSettings CloudFlare { get;set; } = new CloudFlareSettings();
    public string FrontEndBaseUrl { get; set; } = "http://localhost:5173";
  }

  public class CloudFlareSettings
  {
    public const string SectionName = "CloudFlare";
    public bool Enabled { get; set; } = true;
  }
  public class TokenSettings
  {
    public const string SectionName = "Token";

    public int StudentLoginTokenLengthBytes { get; set; } = 32;
    public int StudentLoginTokenExpiryMinutes { get; set; } = 15;
    public int StudentAccessTokenExpiryMinutes { get; set; } = 15;
  }
}