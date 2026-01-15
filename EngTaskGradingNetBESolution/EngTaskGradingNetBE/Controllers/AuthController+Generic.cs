using EngTaskGradingNetBE.Exceptions;
using EngTaskGradingNetBE.Models.Config;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Mvc;

namespace EngTaskGradingNetBE.Controllers;

public partial class AuthController
{
  private class GenericHandler(AuthControllerContext ctx)
  {
    private readonly SecuritySettings securitySettings = ctx.AppSettingsService.GetSettings().Security;

    public async Task<string> RefreshAsync()
    {
      string? teacherRefreshToken = ctx.HttpContext.Request.Cookies[TEACHER_REFRESH_TOKEN_COOKIE_NAME];
      string? studentRefreshToken = ctx.HttpContext.Request.Cookies[STUDENT_REFRESH_TOKEN_COOKIE_NAME];

      if (teacherRefreshToken != null && studentRefreshToken != null)
      {
        Utils.DeleteRefreshToken(ctx.HttpContext, TEACHER_REFRESH_TOKEN_COOKIE_NAME, securitySettings.UseHttps);
        Utils.DeleteRefreshToken(ctx.HttpContext, STUDENT_REFRESH_TOKEN_COOKIE_NAME, securitySettings.UseHttps);
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
      string? refreshToken = ctx.HttpContext.Request.Cookies[TEACHER_REFRESH_TOKEN_COOKIE_NAME];
      if (refreshToken != null)
      {
        try
        {
          await ctx.AuthService.LogoutTeacherAsync(refreshToken);
        }
        catch (Exception ex)
        {
          ctx.Logger.LogError("Failed to logout teacher with refresh-token=" + refreshToken, ex);
          //log error here, but delete refresh token in cookie anyway
        }
        Utils.DeleteRefreshToken(ctx.HttpContext, TEACHER_REFRESH_TOKEN_COOKIE_NAME, securitySettings.UseHttps);
      }

      refreshToken = ctx.HttpContext.Request.Cookies[STUDENT_REFRESH_TOKEN_COOKIE_NAME];
      if (refreshToken != null)
      {
        try
        {
          await ctx.AuthService.LogoutStudentAsync(refreshToken);
        }
        catch (Exception ex)
        {
          ctx.Logger.LogError("Failed to logout student with refresh-token=" + refreshToken, ex);
          //log error here, but delete refresh token in cookie anyway
        }
        Utils.DeleteRefreshToken(ctx.HttpContext, STUDENT_REFRESH_TOKEN_COOKIE_NAME, securitySettings.UseHttps);
      }
    }

    private async Task<string> RefreshTeacherTokenAsync(string refreshToken)
    {
      AuthService.Tokens tmp = await ctx.AuthService.RefreshTeacherAsync(refreshToken);

      DateTime? expiration = tmp.isForSession ? null :
        DateTime.UtcNow.AddMinutes(securitySettings.Teacher.PersistentRefreshTokenExpiryInMinutes);
      string newRefreshToken = tmp.RefreshToken;

      Utils.SetRefreshToken(
        ctx.HttpContext,
        TEACHER_REFRESH_TOKEN_COOKIE_NAME,
        newRefreshToken,
        securitySettings.UseHttps,
        expiration);

      return tmp.AccessToken;
    }

    private async Task<string> RefreshStudentTokenAsync(string refreshToken)
    {
      string accessToken = await ctx.AuthService.GenerateStudentAccessTokenAsync(refreshToken);
      return accessToken;
    }
  }
}
