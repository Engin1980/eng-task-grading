
using EngTaskGradingNetBE.Models.Config;
using EngTaskGradingNetBE.Models.DbModel;
using Microsoft.EntityFrameworkCore;

namespace EngTaskGradingNetBE.Services
{
  public class HealthService(AppDbContext dbContext, IEmailService emailService, AppSettingsService appSettingsService)
  {
    private readonly AppSettings settings = appSettingsService.GetSettings();

    internal async Task<string> GetDbStateAsync()
    {
      string ret;
      try
      {
        await dbContext.Database.ExecuteSqlRawAsync("SELECT 1");
        ret = "Database is reachable.";
      }
      catch (Exception ex)
      {
        ret = $"Database error: {ex.Message}";
      }
      return ret;
    }

    internal async Task<string> GetEmailStateAsync()
    {
      var emSett = settings.Email;
      string ret;
      try
      {
        await emailService.TryReachSmtpServerAsync();
        ret = $"SMTP server is reachable. Active config: {emSett.ActiveConfigName} Sender redirect: "
          + (emSett.DebugEmailRecipient == null ? "no" : emSett.DebugEmailRecipient);
      }
      catch (Exception ex)
      {
        ret = $"SMTP server error: {ex.Message}. Active config: {emSett.ActiveConfigName}";
      }
      return ret;
    }
  }
}
