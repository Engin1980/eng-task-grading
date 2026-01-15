using EngTaskGradingNetBE.Exceptions;
using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models.Config;
using EngTaskGradingNetBE.Models.Dtos;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Mvc;

namespace EngTaskGradingNetBE.Controllers;

public partial class AuthController
{
  private class TeacherHandler(
    HttpContext httpContext,
    AppSettingsService appSettingsService,
    CloudflareTurnistilleService cloudflareTurnistilleService,
    AuthService authService,
    ILogger<AuthController> logger
    )
  {
    private readonly SecuritySettings securitySettings = appSettingsService.GetSettings().Security;

    internal async Task<string> LoginTeacherAsync(TeacherLoginDto request)
    {
      if (appSettingsService.GetSettings().CloudFlare.Enabled)
        await cloudflareTurnistilleService.VerifyAsync(request.CaptchaToken);

      var tmp = await authService.LoginTeacherAsync(request.Email, request.Password);

      string refreshToken = AuthController.Utils.ExpandRefreshToken(tmp.RefreshToken, request.RememberMe);
      DateTime? expiresAt = request.RememberMe
        ? DateTime.UtcNow.AddMinutes(securitySettings.Teacher.RefreshTokenExpiryInMinutes)
        : null;

      AuthController.Utils.SetRefreshToken(
        httpContext,
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
        await authService.InvokePasswordResetProcedure(email);
      }
      catch (EntityNotFoundException)
      {
        logger.LogWarning($"Password reset requested for non-existing email {email}.");
        return; // ignore to prevent user enumeration
      }
      catch (Exception ex)
      {
        logger.LogError(ex, $"Failed to process password reset request for {email}.");
        return; // ignore to prevent user enumeration
      }
    }

    internal async Task SetNewTeacherPassword(SetNewTeacherPasswordRequest data)
    {
      try
      {
        await authService.ResetPasswordAsync(data.Token, data.Email, data.Password);
      }
      catch (Exception ex)
      {
        logger.LogError(ex, $"Failed to set new password for ${data.Email}");
        throw new CommonBadDataException(CommonErrorKind.InvalidPasswordResetData, "");
      }
    }
  }
}