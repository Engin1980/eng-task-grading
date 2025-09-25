using EngTaskGradingNetBE.Exceptions;
using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models.Config;
using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel;
using static EngTaskGradingNetBE.Controllers.StudentViewController;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace EngTaskGradingNetBE.Controllers
{
  [ApiController]
  [Route("api/v1/auth")]
  public class AuthController(
    AuthService authService,
    AppSettingsService appSettingsService,
    CloudflareTurnistilleService cloudflareTurnistilleService,
    StudentViewService studentViewService,
    ILogger<AuthController> logger) : ControllerBase
  {
    private const string TEACHER_REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
    private const string STUDENT_REFRESH_TOKEN_COOKIE_NAME = "studentRefreshToken";
    private const string DELETE_ON_SESSION_END_PREFIX = "!-!";
    private readonly SecuritySettings securitySettings = appSettingsService.GetSettings().Security;

    public record VerifyRequest(string Token, int DurationSeconds);
    public record StudentViewLoginDto(string StudentNumber, string? CaptchaToken = null);

    [HttpPost("teacher/login")]
    public async Task<string> LoginTeacherAsync([FromBody] TeacherLoginDto request)
    {
      if (appSettingsService.GetSettings().CloudFlare.Enabled)
        await cloudflareTurnistilleService.VerifyAsync(request.CaptchaToken);

      var tmp = await authService.LoginTeacherAsync(request.Email, request.Password);

      string refreshToken = ExpandTeacherRefreshToken(tmp.RefreshToken, request.RememberMe);
      DateTime? expiresAt = request.RememberMe
        ? DateTime.UtcNow.AddMinutes(securitySettings.Teacher.RefreshTokenExpiryInMinutes)
        : null;

      SetRefreshToken(
        TEACHER_REFRESH_TOKEN_COOKIE_NAME,
        refreshToken,
        expiresAt
        );

      return tmp.AccessToken;
    }

    [HttpPost("refresh")]
    public async Task<string> RefreshAsync()
    {
      string? teacherRefreshToken = Request.Cookies[TEACHER_REFRESH_TOKEN_COOKIE_NAME];
      string? studentRefreshToken = Request.Cookies[STUDENT_REFRESH_TOKEN_COOKIE_NAME];

      if (teacherRefreshToken != null && studentRefreshToken != null)
      {
        DeleteRefreshToken(TEACHER_REFRESH_TOKEN_COOKIE_NAME);
        DeleteRefreshToken(STUDENT_REFRESH_TOKEN_COOKIE_NAME);
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

    [HttpPost("logout")]
    public async System.Threading.Tasks.Task LogoutAsync()
    {
      string? refreshToken = Request.Cookies[TEACHER_REFRESH_TOKEN_COOKIE_NAME];
      if (refreshToken != null)
      {
        refreshToken = ShrinkTeacherRefreshToken(refreshToken, out bool _);
        try
        {
          await authService.LogoutTeacherAsync(refreshToken);
        }
        catch (Exception ex)
        {
          logger.LogError("Failed to logout teacher with refresh-token=" + refreshToken, ex);
          //log error here, but delete refresh token in cookie anyway
        }
        DeleteRefreshToken(TEACHER_REFRESH_TOKEN_COOKIE_NAME);
      }

      refreshToken = Request.Cookies[STUDENT_REFRESH_TOKEN_COOKIE_NAME];
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
        DeleteRefreshToken(STUDENT_REFRESH_TOKEN_COOKIE_NAME);
      }
    }

    [HttpPost("teacher/request-password-reset")]
    public async System.Threading.Tasks.Task RequestPasswordResetAsync(string email)
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

    [Authorize(Roles = Roles.STUDENT_ROLE)]
    [HttpPost("student/forget-all")]
    public async System.Threading.Tasks.Task ForgetToken([FromBody] string token)
    {
      await authService.StudentViewForgetAllRefreshsTokenAsync(token);
      DeleteRefreshToken(STUDENT_REFRESH_TOKEN_COOKIE_NAME);
    }

    [HttpPost("student/login")]
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

    [HttpPost("student/verify")]
    public async Task<string> Verify(VerifyRequest request)
    {
      AuthService.Tokens tmp;
      try
      {
        tmp = await authService.StudentViewVerifyAsync(request.Token, request.DurationSeconds);
      }
      catch (Exception ex)
      {
        logger.LogError(ex, $"Failed to complete verification for {request.Token}.");
        throw;
      }

      SetRefreshToken(STUDENT_REFRESH_TOKEN_COOKIE_NAME, tmp.RefreshToken, DateTime.UtcNow.AddSeconds(request.DurationSeconds));
      return tmp.AccessToken;
    }

    private void SetRefreshToken(string tokenName, string refreshToken, DateTime? expiresAt)
    {
      CookieOptions opts = BuildTokenCookieOptions(expiresAt);
      HttpContext.Response.Cookies.Append(tokenName, refreshToken, opts);
    }

    private void DeleteRefreshToken(string tokenName)
    {
      CookieOptions opts = BuildTokenCookieOptions(DateTime.Now.AddDays(-10));
      HttpContext.Response.Cookies.Append(tokenName, "-to-delete-", opts);
    }

    private CookieOptions BuildTokenCookieOptions(DateTime? expirationUtcDateTime = null) => new()
    {
      HttpOnly = true,
      SameSite = SameSiteMode.Lax,
      Secure = appSettingsService.GetSettings().Security.UseHttps,
      Expires = expirationUtcDateTime
    };

    private async Task<string> RefreshTeacherTokenAsync(string refreshToken)
    {
      refreshToken = ShrinkTeacherRefreshToken(refreshToken, out bool deleteOnSessionEnd);

      AuthService.Tokens tmp = await authService.RefreshTeacherAsync(refreshToken);

      DateTime? expiration;
      string newRefreshToken;

      newRefreshToken = ExpandTeacherRefreshToken(tmp.RefreshToken, deleteOnSessionEnd);
      expiration = deleteOnSessionEnd ? null : DateTime.UtcNow.AddMinutes(securitySettings.Teacher.RefreshTokenExpiryInMinutes);

      SetRefreshToken(
        TEACHER_REFRESH_TOKEN_COOKIE_NAME,
        newRefreshToken,
        expiration);

      return tmp.AccessToken;
    }

    private async Task<string> RefreshStudentTokenAsync(string refreshToken)
    {
      string accessToken = await authService.RefreshStudentAsync(refreshToken);
      return accessToken;
    }

    private string ExpandTeacherRefreshToken(string token, bool isSessionOnly)
    {
      return isSessionOnly ? DELETE_ON_SESSION_END_PREFIX + token : token;
    }

    private string ShrinkTeacherRefreshToken(string token, out bool isSesionOnly)
    {
      isSesionOnly = token.StartsWith(DELETE_ON_SESSION_END_PREFIX);
      return isSesionOnly ? token[DELETE_ON_SESSION_END_PREFIX.Length..] : token;
    }
  }
}
