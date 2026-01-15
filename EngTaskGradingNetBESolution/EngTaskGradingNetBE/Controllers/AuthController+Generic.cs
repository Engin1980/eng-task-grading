using EngTaskGradingNetBE.Exceptions;
using EngTaskGradingNetBE.Models.Config;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Mvc;

namespace EngTaskGradingNetBE.Controllers;

public partial class AuthController
{
  private class GenericHandler(
    HttpContext httpContext,
    AppSettingsService appSettingsService,
    AuthService authService,
    ILogger<AuthController> logger
    )
  {
    private readonly SecuritySettings securitySettings = appSettingsService.GetSettings().Security;

    public async Task<string> RefreshAsync()
    {
      string? teacherRefreshToken = httpContext.Request.Cookies[TEACHER_REFRESH_TOKEN_COOKIE_NAME];
      string? studentRefreshToken = httpContext.Request.Cookies[STUDENT_REFRESH_TOKEN_COOKIE_NAME];

      if (teacherRefreshToken != null && studentRefreshToken != null)
      {
        Utils.DeleteRefreshToken(httpContext, TEACHER_REFRESH_TOKEN_COOKIE_NAME, securitySettings.UseHttps);
        Utils.DeleteRefreshToken(httpContext, STUDENT_REFRESH_TOKEN_COOKIE_NAME, securitySettings.UseHttps);
        throw new InvalidCredentialsException();
      }
      else if (teacherRefreshToken == null && studentRefreshToken == null)
        throw new InvalidCredentialsException();

      if (teacherRefreshToken != null)
        return await RefreshTeacherTokenAsync(teacherRefreshToken);

      if (studentRefreshToken != null)
        return await RefreshStudentTokenAsync(studentRefreshToken);

      throw new ApplicationException("It's not supposed to get here.");
    }

    internal async Task LogoutAsync()
    {
      string? refreshToken = httpContext.Request.Cookies[TEACHER_REFRESH_TOKEN_COOKIE_NAME];
      if (refreshToken != null)
      {
        refreshToken = AuthController.Utils.ShrinkRefreshToken(refreshToken, out bool _);
        try
        {
          await authService.LogoutTeacherAsync(refreshToken);
        }
        catch (Exception ex)
        {
          logger.LogError("Failed to logout teacher with refresh-token=" + refreshToken, ex);
          //log error here, but delete refresh token in cookie anyway
        }
        Utils.DeleteRefreshToken(httpContext, TEACHER_REFRESH_TOKEN_COOKIE_NAME, securitySettings.UseHttps);
      }

      refreshToken = httpContext.Request.Cookies[STUDENT_REFRESH_TOKEN_COOKIE_NAME];
      if (refreshToken != null)
      {
        try
        {
          await authService.LogoutStudentAsync(refreshToken);
        }
        catch (Exception ex)
        {
          logger.LogError("Failed to logout student with refresh-token=" + refreshToken, ex);
          //log error here, but delete refresh token in cookie anyway
        }
        Utils.DeleteRefreshToken(httpContext, STUDENT_REFRESH_TOKEN_COOKIE_NAME, securitySettings.UseHttps);
      }
    }

    private async Task<string> RefreshTeacherTokenAsync(string refreshToken)
    {
      refreshToken = Utils.ShrinkRefreshToken(refreshToken, out bool deleteOnSessionEnd);

      AuthService.Tokens tmp = await authService.RefreshTeacherAsync(refreshToken);

      DateTime? expiration;
      string newRefreshToken;

      newRefreshToken = Utils.ExpandRefreshToken(tmp.RefreshToken, deleteOnSessionEnd);
      expiration = deleteOnSessionEnd ? null : DateTime.UtcNow.AddMinutes(securitySettings.Teacher.RefreshTokenExpiryInMinutes);

      Utils.SetRefreshToken(
        httpContext,
        TEACHER_REFRESH_TOKEN_COOKIE_NAME,
        newRefreshToken,
        securitySettings.UseHttps,
        expiration);

      return tmp.AccessToken;
    }

    private async Task<string> RefreshStudentTokenAsync(string refreshToken)
    {
      string accessToken = await authService.RefreshStudentAsync(refreshToken);
      return accessToken;
    }
  }
}
