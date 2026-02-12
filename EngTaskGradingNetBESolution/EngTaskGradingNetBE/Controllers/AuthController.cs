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
  public partial class AuthController : ControllerBase
  {
    private const string TEACHER_REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
    private const string STUDENT_REFRESH_TOKEN_COOKIE_NAME = "studentRefreshToken";

    private readonly AuthControllerContext ctx;
    private readonly TeacherHandler teacherHandler;
    private readonly StudentHandler studentHandler;
    private readonly GenericHandler genericHandler;

    public AuthController(
      TeacherAuthService teacherAuthService,
      StudentAuthService studentAuthService,
      AppSettingsService appSettingsService,
      CloudflareTurnistilleService cloudflareTurnistilleService,
      StudentViewService studentViewService,
      ILogger<AuthController> logger)
    {
      ctx = new(
        () => this.HttpContext,
        () => appSettingsService,
        () => cloudflareTurnistilleService,
        () => teacherAuthService,
        () => studentAuthService,
        () => logger,
        () => studentViewService
        );

      teacherHandler = new(ctx);
      studentHandler = new(ctx);
      genericHandler = new(ctx);
    }

    public record VerifyRequest(string Token, int DurationSeconds);
    public record StudentViewLoginDto(string StudentNumber, string? CaptchaToken = null);

    [HttpPost("refresh")]
    public async Task<string> RefreshAsync()
      => await genericHandler.RefreshAsync();

    [HttpPost("logout")]
    public async System.Threading.Tasks.Task LogoutAsync() => await genericHandler.LogoutAsync();

    [HttpPost("teacher/login")]
    public async Task<string> LoginTeacherAsync([FromBody] TeacherLoginDto request)
      => await teacherHandler.LoginTeacherAsync(request);

    [HttpPost("teacher/request-password-reset")]
    public async System.Threading.Tasks.Task RequestPasswordResetAsync([FromBody] string email)
      => await teacherHandler.RequestPasswordResetAsync(email);

    public record SetNewTeacherPasswordRequest(string Token, string Email, string Password);
    [HttpPost("teacher/set-new-teacher-password")]
    public async System.Threading.Tasks.Task SetNewTeacherPassword([FromBody] SetNewTeacherPasswordRequest data)
      => await teacherHandler.SetNewTeacherPassword(data);

    [Authorize(Roles = Roles.STUDENT_ROLE)]
    [HttpPost("student/forget-all")]
    public async System.Threading.Tasks.Task ForgetToken([FromBody] string token)
      => await studentHandler.ForgetToken(token);

    [HttpPost("student/login")]
    public async System.Threading.Tasks.Task LoginAsync(StudentViewLoginDto data)
      => await studentHandler.LoginAsync(data);

    [HttpPost("student/verify")]
    public async Task<string> Verify(VerifyRequest request)
      => await studentHandler.Verify(request);
  }
}
