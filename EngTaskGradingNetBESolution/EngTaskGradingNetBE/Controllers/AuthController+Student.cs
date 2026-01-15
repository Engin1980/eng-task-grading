using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models.Config;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EngTaskGradingNetBE.Controllers;

public partial class AuthController
{
  private class StudentHandler(AuthControllerContext ctx)
  {
    private readonly SecuritySettings securitySettings = ctx.AppSettingsService.GetSettings().Security;

    internal async Task ForgetToken([FromBody] string token)
    {
      await ctx.AuthService.StudentViewForgetAllRefreshsTokenAsync(token);
      Utils.DeleteRefreshToken(ctx.HttpContext, STUDENT_REFRESH_TOKEN_COOKIE_NAME, securitySettings.UseHttps);
    }

    internal async Task LoginAsync(StudentViewLoginDto data)
    {
      try
      {
        if (ctx.AppSettingsService.GetSettings().CloudFlare.Enabled)
          await ctx.CloudflareTurnistilleService.VerifyAsync(data.CaptchaToken);
        await ctx.StudentViewService.SendInvitationAsync(data.StudentNumber);
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
        res = await ctx.AuthService.StudentViewGrantAccessByLoginTokenAsync(request.Token, request.DurationSeconds);
      }
      catch (Exception ex)
      {
        ctx.Logger.LogError(ex, $"Failed to complete verification for {request.Token}.");
        throw;
      }

      DateTime? duration = request.DurationSeconds == 0 ? null : DateTime.UtcNow.AddSeconds(request.DurationSeconds);
      AuthController.Utils.SetRefreshToken(
        ctx.HttpContext, STUDENT_REFRESH_TOKEN_COOKIE_NAME, res.RefreshToken, securitySettings.UseHttps, duration);
      return res.AccessToken;
    }
  }
}
