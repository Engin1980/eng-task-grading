using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models.Config;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EngTaskGradingNetBE.Controllers;

public partial class AuthController
{
  private class StudentHandler(
    HttpContext httpContext,
    AuthService authService,
    AppSettingsService appSettingsService,
    CloudflareTurnistilleService cloudflareTurnistilleService,
    StudentViewService studentViewService,
    ILogger<AuthController> logger
    )
  {
    private readonly SecuritySettings securitySettings = appSettingsService.GetSettings().Security;

    internal async Task ForgetToken([FromBody] string token)
    {
      await authService.StudentViewForgetAllRefreshsTokenAsync(token);
      Utils.DeleteRefreshToken(httpContext, STUDENT_REFRESH_TOKEN_COOKIE_NAME, securitySettings.UseHttps);
    }

    internal async Task LoginAsync(StudentViewLoginDto data)
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

    internal async Task<string> Verify(VerifyRequest request)
    {
      AuthService.Tokens res;
      try
      {
        res = await authService.StudentViewVerifyAsync(request.Token, request.DurationSeconds);
      }
      catch (Exception ex)
      {
        logger.LogError(ex, $"Failed to complete verification for {request.Token}.");
        throw;
      }

      AuthController.Utils.SetRefreshToken(httpContext, STUDENT_REFRESH_TOKEN_COOKIE_NAME, res.RefreshToken, securitySettings.UseHttps, DateTime.UtcNow.AddSeconds(request.DurationSeconds));
      return res.AccessToken;
    }
  }
}
