using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Mvc;

namespace EngTaskGradingNetBE.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class StudentViewController(
  AppSettingsService appSettingsService,
  StudentViewService studentViewService, 
  CloudflareTurnistilleService cloudflareTurnistilleService) : ControllerBase
{
  [HttpPost("login")]
  public async System.Threading.Tasks.Task LoginAsync(StudentViewLoginDto data)
  {
    try
    {
      if (appSettingsService.GetSettings().CloudFlare.Enabled)
        await cloudflareTurnistilleService.VerifyAsync(data.CaptchaToken);
      await studentViewService.SendInvitationAsync(data.StudentNumber);
    }
    catch (Exception ex)
    {
      // Log exception details if necessary
      throw new ApplicationException("Failed to process student-view-login.", ex);
    }
  }

  public record StudentViewLoginDto(
      string StudentNumber,
      string? CaptchaToken = null
  );
}