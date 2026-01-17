using EngTaskGradingNetBE.Exceptions;
using EngTaskGradingNetBE.Exceptions.BadData;
using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models.Config;
using EngTaskGradingNetBE.Models.Dtos;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Mvc;

namespace EngTaskGradingNetBE.Controllers;

public partial class AuthController
{
  private class TeacherHandler(AuthControllerContext ctx)
  {
    private readonly SecuritySettings securitySettings = ctx.AppSettingsService.GetSettings().Security;

    internal async Task<string> LoginTeacherAsync(TeacherLoginDto request)
    {
      if (ctx.AppSettingsService.GetSettings().CloudFlare.Enabled)
        await ctx.CloudflareTurnistilleService.VerifyAsync(request.CaptchaToken);

      var tmp = await ctx.AuthService.LoginTeacherAsync(request.Email, request.Password, request.RememberMe);

      string refreshToken = tmp.RefreshToken;
      DateTime? expiresAt = request.RememberMe
        ? DateTime.UtcNow.AddMinutes(securitySettings.Teacher.PersistentRefreshTokenExpiryInMinutes)
        : null;

      AuthController.Utils.SetRefreshToken(
        ctx.HttpContext,
        TEACHER_REFRESH_TOKEN_COOKIE_NAME,
        refreshToken,
        securitySettings.UseHttps,
        expiresAt
        );

      return tmp.AccessToken;
    }

    internal async Task RequestPasswordResetAsync([FromBody] string email)
    {
      try
      {
        await ctx.AuthService.InvokeTeacherPasswordResetProcedure(email);
      }
      catch (BadDataException)
      {
        ctx.Logger.LogWarning($"Password reset requested for non-existing email {email}.");
        return; // ignore to prevent user enumeration
      }
      catch (Exception ex)
      {
        ctx.Logger.LogError(ex, $"Failed to process password reset request for {email}.");
        throw;
      }
    }

    internal async Task SetNewTeacherPassword(SetNewTeacherPasswordRequest data)
    {
      try
      {
        await ctx.AuthService.ResetPasswordAsync(data.Token, data.Email, data.Password);
      }
      catch (Exception ex)
      {
        ctx.Logger.LogError(ex, $"Failed to set new password for ${data.Email}");
        throw;
      }
    }
  }
}