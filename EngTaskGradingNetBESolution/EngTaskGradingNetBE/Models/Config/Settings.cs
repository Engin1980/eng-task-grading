namespace EngTaskGradingNetBE.Models.Config
{
  public class AppSettings
  {
    public TokenSettings Token { get; set; } = new TokenSettings();
    public CloudFlareSettings CloudFlare { get; set; } = new CloudFlareSettings();
    public EmailSettings Email { get; set; } = new EmailSettings();
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

  public class EmailSettings
  {
    public const string SectionName = "Email";
    
    public string ActiveConfigName { get; set; } = string.Empty;
    public string? DebugEmailRecipient { get; set; } = null;
    public List<EmailConfig> Configs { get; set; } = [];
    
    /// <summary>
    /// Gets the active email configuration based on ActiveConfigName
    /// </summary>
    public EmailConfig? GetActiveConfig()
    {
      return Configs.FirstOrDefault(c => c.Name.Equals(ActiveConfigName, StringComparison.OrdinalIgnoreCase));
    }
  }

  public class EmailConfig
  {
    public string Name { get; set; } = string.Empty;
    public string SmtpServer { get; set; } = string.Empty;
    public int SmtpPort { get; set; } = 0;
    public string SenderName { get; set; } = string.Empty;
    public string SenderEmail { get; set; } = string.Empty;
    public string SenderPassword { get; set; } = string.Empty;
  }
}