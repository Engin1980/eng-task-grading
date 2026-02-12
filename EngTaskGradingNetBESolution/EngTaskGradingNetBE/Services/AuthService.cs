using Azure.Core;
using EngTaskGradingNetBE.Exceptions;
using EngTaskGradingNetBE.Exceptions.BadData.Common;
using EngTaskGradingNetBE.Exceptions.BadData.NotFound;
using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models.Config;
using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Identity.Client;
using Newtonsoft.Json.Linq;
using System.Diagnostics.Eventing.Reader;
using System.Net.Mail;
using System.Text.RegularExpressions;

namespace EngTaskGradingNetBE.Services
{
  public record TokenSet(string AccessToken, string RefreshToken, bool IsForSession);

  public class AuthService(
    AppDbContext context,
    AppSettingsService appSettingsService,
    TokenService tokenService)
    : DbContextBaseService(context)
  {
    protected readonly SecuritySettings sett = appSettingsService.GetSettings().Security;

    internal async System.Threading.Tasks.Task LogoutAsync(string refreshToken)
    {
      await tokenService.DeleteAsync(refreshToken);
      await tokenService.ClearExpiredTokensAsync();
    }

    protected string GenerateJwtToken(string email, string roleName, int expiratonInMinutes)
    {
      var jwtKey = appSettingsService.GetSettings().Security.AccessTokenJwtSecretKey;
      if (string.IsNullOrEmpty(jwtKey))
        throw new InvalidOperationException("JWT secret key is not configured.");

      var key = System.Text.Encoding.ASCII.GetBytes(jwtKey);
      var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();

      var claims = new[]
      {
        new System.Security.Claims.Claim("sub", email),
        new System.Security.Claims.Claim("role", roleName)
      };

      var tokenDescriptor = new Microsoft.IdentityModel.Tokens.SecurityTokenDescriptor
      {
        Subject = new System.Security.Claims.ClaimsIdentity(claims),
        Expires = DateTime.UtcNow.AddMinutes(expiratonInMinutes),
        NotBefore = DateTime.UtcNow,
        IssuedAt = DateTime.UtcNow,
        SigningCredentials = new Microsoft.IdentityModel.Tokens.SigningCredentials(
          new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key),
          Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256Signature)
      };

      var token = tokenHandler.CreateToken(tokenDescriptor);
      var jwt = tokenHandler.WriteToken(token);
      return jwt;
    }
  }

  public class TeacherAuthService : AuthService
  {

    private const string PERSISTENT_TAG = "(p)";
    private readonly TokenService tokenService;
    private readonly AppSettingsService appSettingsService;
    private readonly TeacherService teacherService;
    private readonly IEmailService emailService;

    public TeacherAuthService(
      AppDbContext context,
      TokenService tokenService,
      AppSettingsService appSettingsService,
      TeacherService teacherService,
      IEmailService emailService) : base(context, appSettingsService, tokenService)
    {
      this.tokenService = tokenService;
      this.appSettingsService = appSettingsService;
      this.teacherService = teacherService;
      this.emailService = emailService;
    }

    internal async Task<TokenSet> LoginAsync(
      string email, string password, bool rememberTeacherOverSessions)
    {
      EAssert.Arg.IsNotEmpty(email, nameof(email));
      EAssert.Arg.IsNotEmpty(password, nameof(password));

      Teacher teacher = await Db.Teachers
        .FirstOrDefaultAsync(t => t.Email == email)
        ?? throw new InvalidCredentialsException();

      if (teacher.IsActive == false)
        throw new InvalidCredentialsException();

      string hash = teacher.PasswordHash;
      if (!BCrypt.Net.BCrypt.Verify(password, hash))
        throw new InvalidCredentialsException();

      string? tag = rememberTeacherOverSessions ? PERSISTENT_TAG : null;
      int expiryMinutes = rememberTeacherOverSessions ? sett.Teacher.PersistentRefreshTokenExpiryInMinutes : sett.Teacher.SessionRefreshTokenExpiryInMinutes;
      string refreshToken = await tokenService.CreateAsync(
        TokenType.TeacherRefresh, email, tag, TokenUniquessBehavior.NoCheck,
        sett.RefreshTokenLengthBytes, expiryMinutes);

      string accessToken = GenerateJwtToken(
        teacher.Email,
        Roles.TEACHER_ROLE,
        sett.Teacher.AccessTokenExpiryMinutes);

      return new(accessToken, refreshToken, rememberTeacherOverSessions);
    }

    internal async System.Threading.Tasks.Task SetPasswordAsync(int teacherId, string password)
    {
      if (!IsPasswordRequirementFulfilled(password))
        throw new PasswordsRequirementsNotFulfilledException();

      string passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
      Teacher teacher = await Db.Teachers.FirstOrDefaultAsync(t => t.Id == teacherId)
        ?? throw new Exceptions.BadData.NotFound.EntityNotFoundException<Teacher>(teacherId);

      teacher.PasswordHash = passwordHash;
      await Db.SaveChangesAsync();
    }

    internal async System.Threading.Tasks.Task InvokePasswordResetProcedure(string email)
    {
      Teacher teacher = await Db.Teachers
        .FirstOrDefaultAsync(t => t.Email == email)
        ?? throw new Exceptions.BadData.NotFound.EntityNotFoundException<Teacher>(email);

      string token = await tokenService.CreateAsync(
        TokenType.TeacherPasswordReset, email, null, TokenUniquessBehavior.DeleteExisting,
        sett.Teacher.PasswordResetTokenLength, 60); //TODO add 1 hour to the config
      await SendResetPasswordEmail(teacher.Email, token);
    }

    internal async Task<TokenSet> RefreshAsync(string refreshToken)
    {
      if (refreshToken.Length == 0)
        throw new InvalidCredentialsException();

      bool isPersistent;
      string email;
      {
        Token token = await tokenService.GetTokenIfValidAsync(refreshToken, TokenType.TeacherRefresh, true);
        isPersistent = token.Tag == PERSISTENT_TAG;
        email = token.Key;
      }

      Teacher teacher = await teacherService.GetByEmailAsync(email);
      if (teacher.IsActive == false) throw new InvalidCredentialsException();

      string newRefreshToken = await tokenService.CreateAsync(
        TokenType.TeacherRefresh, email, isPersistent ? PERSISTENT_TAG : null, TokenUniquessBehavior.NoCheck,
        sett.RefreshTokenLengthBytes,
        isPersistent ? sett.Teacher.PersistentRefreshTokenExpiryInMinutes : sett.Teacher.SessionRefreshTokenExpiryInMinutes);

      string accessToken = GenerateJwtToken(
        email,
        Roles.TEACHER_ROLE,
        sett.Teacher.AccessTokenExpiryMinutes);

      TokenSet ret = new(
        accessToken,
        newRefreshToken,
        isPersistent);
      return ret;
    }

    internal async System.Threading.Tasks.Task ResetPasswordAsync(string tokenValue, string email, string password)
    {
      Token token = await tokenService.GetTokenIfValidAsync(tokenValue, TokenType.TeacherPasswordReset, email, true);
      Teacher teacher = await teacherService.GetByEmailAsync(token.Key);
      await SetPasswordAsync(teacher.Id, password);
    }

    private bool IsPasswordRequirementFulfilled(string password)
    {
      var passwordRegex = new Regex(sett.Teacher.PasswordRegex, RegexOptions.Compiled);
      if (string.IsNullOrWhiteSpace(password)) return false;
      return passwordRegex.IsMatch(password);
    }

    private async System.Threading.Tasks.Task SendResetPasswordEmail(string emailAddress, string token)
    {
      string title = "Obnovení hesla do systému EngTaskGrading";
      string feUrl = appSettingsService.GetSettings().FrontEndUrl;
      string body = $"""
        <p>Dobrý den,</p>
        <p>pro váš účet byla přijata žádost o obnovení hesla do systému EngTaskGrading.</p>
        <p>Pokud jste o toto obnovení požádali, klikněte na následující odkaz. Odkaz je platný 1 hodinu od obdržení tohoto e-mailu.</p>
        <p><a href="{feUrl}/teacherPasswordReset/set-new-password/{token}">Obnovit heslo do systému známek EngTaskGrading</a></p>
        <p>Pokud jste o toto obnovení nepožádali, tento e-mail ignorujte, vaše heslo zůstane nezměněno.</p>
        <p>V případě dotazů prosím kontaktuje administrátora systému.</p>
        <p>Hezký den přeje tým EngTaskGrading.</p>
        """;
      try
      {
        await emailService.SendEmailAsync(emailAddress, title, body);
      }
      catch (Exception ex)
      {
        throw new InvalidOperationException("Failed to send reset password email.", ex);
      }
    }
  }

  public class StudentAuthService : AuthService
  {
    private const string SELF_SIGN_PREFIX = "Self-Sign-";
    private readonly TokenService tokenService;
    private readonly StudentService studentService;
    private readonly AppSettingsService appSettingsService;
    private readonly IEmailService emailService;

    public StudentAuthService(
      AppDbContext context,
      TokenService tokenService,
      StudentService studentService,
      AppSettingsService appSettingsService,
      IEmailService emailService
    ) : base(context, appSettingsService, tokenService)
    {
      this.tokenService = tokenService;
      this.studentService = studentService;
      this.appSettingsService = appSettingsService;
      this.emailService = emailService;
    }

    internal async System.Threading.Tasks.Task ForgetAllRefreshsTokenAsync(string refreshToken)
    {
      Token token = await tokenService.GetTokenIfValidAsync(refreshToken, TokenType.StudentAccess, true);
      await tokenService.DeleteAllByKeyAsync(TokenType.StudentAccess, token.Key);
    }

    internal async Task<string> GenerateAccessTokenAsync(string refreshToken)
    {
      Token token = await tokenService.GetTokenIfValidAsync(refreshToken, TokenType.StudentAccess, true);
      Student _ = await studentService.GetByStudyNumberAsync(token.Key); // just to ensure that student exists

      string accessToken = GenerateJwtToken(
        token.Key,
        Roles.STUDENT_ROLE,
        sett.Student.AccessTokenExpiryMinutes);

      return accessToken;
    }

    internal async System.Threading.Tasks.Task GenerateAttendanceDaySelfSignTokenAsync(AttendanceDaySelfSign adss)
    {
      int attendanceDaySelfSignId = adss.Id;
      Student student = adss.Student;
      AttendanceDay atd = adss.AttendanceDay;
      Attendance att = atd.Attendance;
      Course c = att.Course;

      string token = await tokenService.CreateAsync(TokenType.StudentAttendanceDaySelfSign,
        $"{SELF_SIGN_PREFIX}{attendanceDaySelfSignId}", TokenUniquessBehavior.DeleteExisting,
        sett.Student.AttendanceDaySelfSignTokenLengtBytes, sett.Student.AttendanceDaySelfSignTokenExpiryInMinutes);

      await Db.SaveChangesAsync();
      await SendValidationRequestEmailForAttendanceDaySelfSign(student.Email, c, att, atd, token);
    }

    internal async Task<int> ApplyAttendanceDaySelfSignTokenAsync(string tokenString)
    {

      Token token = await tokenService.GetTokenIfValidAsync(tokenString, TokenType.StudentAttendanceDaySelfSign, true);
      string idS = token.Key[SELF_SIGN_PREFIX.Length..];
      int id = int.Parse(idS);
      return id;
    }

    internal async Task<TokenSet> GrantAccessByLoginTokenAsync(string loginTokenValue, int durationSeconds)
    {
      Token token = await tokenService.GetTokenIfValidAsync(loginTokenValue, TokenType.StudentLogin, true);
      Student student = await studentService.GetByStudyNumberAsync(token.Key);

      string refreshToken = await tokenService.CreateAsync(
        TokenType.StudentAccess, student.Number, TokenUniquessBehavior.NoCheck,
        sett.RefreshTokenLengthBytes, durationSeconds);

      string accessToken = GenerateJwtToken(
        student.Email,
        Roles.STUDENT_ROLE,
        sett.Student.AccessTokenExpiryMinutes);

      return new(accessToken, refreshToken, true);
    }

    private async System.Threading.Tasks.Task SendValidationRequestEmailForAttendanceDaySelfSign(
     string emailAddress, Course course, Attendance att, AttendanceDay atd, string token)
    {
      string courseRef = course.Name != null ? $"{course.Name} ({course.Code})" : course.Code;
      string attendanceDayTitle = $"{att.Title} - {atd.Title}";

      string title = $"Potvrzení ručního samo-zápisu do kurzu {course.Name} v systému EngTaskGrading";
      string feUrl = appSettingsService.GetSettings().FrontEndUrl;
      string body = $$"""
        <p>Dobrý den,</p>
        <p>pro váš účet byla přijata žádost o samozápis  na termín <strong>{{attendanceDayTitle}}</strong>
        v kurzu <string>{{courseRef}}</strong>. 
        <p>Pokud jste o tento zápis požádali, klikněte na následující odkaz. </p>
        <p><a href="{{feUrl}}/studentView/self-sign-verify/{{token}}">Potvrdit docházku na kurzu</a></p>
        <p>Pokud jste o zápis nepožádali, tento e-mail ignorujte. Pokud se situace opakuje, nebo v případě  dotazů prosím kontaktuje administrátora systému.</p>
        <p>Hezký den přeje tým EngTaskGrading.</p>
        """;
      try
      {
        await emailService.SendEmailAsync(emailAddress, title, body);
      }
      catch (Exception ex)
      {
        throw new InvalidOperationException("Failed to send reset password email.", ex);
      }
    }
  }
}
