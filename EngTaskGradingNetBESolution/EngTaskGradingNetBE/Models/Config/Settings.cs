namespace EngTaskGradingNetBE.Models.Config
{
  public class AppSettings
  {
    public SecuritySettings Security { get; set; } = new SecuritySettings();
    public CloudFlareSettings CloudFlare { get; set; } = new CloudFlareSettings();
    public EmailSettings Email { get; set; } = new EmailSettings();
    //public KeycloakSettings Keycloak { get; set; } = new KeycloakSettings();
    public string FrontEndUrl { get; set; } = string.Empty;
  }

  public class SecuritySettings
  {
    public const string SectionName = "Security";

    public StudentSecuritySettings Student { get; set; } = new StudentSecuritySettings();
    public TeacherSecuritySettings Teacher { get; set; } = new TeacherSecuritySettings();
    public string AccessTokenJwtSecretKey { get; set; } = string.Empty;
    public bool UseHttps { get; set; } = false;
    public int RefreshTokenLengthBytes { get; set; } = 32;
  }

  public class StudentSecuritySettings
  {
    public const string SectionName = "Student";

    public int LoginTokenLengthBytes { get; set; } = 32;
    public int LoginTokenExpiryMinutes { get; set; } = 15;
    public int AccessTokenExpiryMinutes { get; set; } = 5;
  }

  public class TeacherSecuritySettings
  {
    public const string SectionName = "Teacher";

    public int PasswordResetTokenExpiryMinutes { get; set; } = 60;
    public int PasswordResetTokenLength { get; set; } = 128;
    public int AccessTokenExpiryMinutes { get; set; } = 5;
    public int RefreshTokenExpiryInMinutes { get; set; } = 60 * 8;
  }

  public class CloudFlareSettings
  {
    public const string SectionName = "CloudFlare";
    public bool Enabled { get; set; } = true;
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