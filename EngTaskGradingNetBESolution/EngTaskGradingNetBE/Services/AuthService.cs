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
using System.Diagnostics.Eventing.Reader;
using System.Net.Mail;
using System.Text.RegularExpressions;

namespace EngTaskGradingNetBE.Services
{
  public class AuthService(
    AppDbContext context,
    IEmailService emailService,
    AppSettingsService appSettingsService,
    ILogger<AuthService> logger) : DbContextBaseService(context)
  {
    private readonly SecuritySettings sett = appSettingsService.GetSettings().Security;
    public record Tokens(string AccessToken, string RefreshToken, bool IsForSession);

    private async Task<Student> GetStudentByLoginTokenOrFailAsync(string loginTokenValue)
    {
      logger.LogDebug("Attempting to get student by login token at {time}.", DateTime.UtcNow);
      StudentViewToken token = await Db.StudentViewTokens
        .Include(q => q.Student)
        .FirstOrDefaultAsync(q => q.Token == loginTokenValue && q.Type == StudentViewTokenType.Login)
        ?? throw new InvalidTokenException(InvalidTokenException.ETokenType.Authentication, InvalidTokenException.EInvalidationType.NotFound);

      Db.StudentViewTokens.Remove(token);
      await Db.SaveChangesAsync();

      DateTime utcNow = DateTime.UtcNow;
      if (utcNow < token.CreatedAt || token.ExpiresAt < utcNow)
      {
        logger.LogWarning(
          "Student login token expired: {TokenId} for student {StudentId}, token time {TokenCreatedAt}-{TokenExpiresAt}, current time {CurrentUtc}",
          token.Id, token.StudentId, token.CreatedAt, token.ExpiresAt, DateTime.UtcNow);
        throw new InvalidTokenException(InvalidTokenException.ETokenType.Authentication, InvalidTokenException.EInvalidationType.Expired);
      }

      return token.Student;
    }

    internal async Task<Tokens> StudentViewGrantAccessByLoginTokenAsync(string loginTokenValue, int durationSeconds)
    {
      Student student = await GetStudentByLoginTokenOrFailAsync(loginTokenValue);

      StudentViewToken refreshToken = new()
      {
        CreatedAt = DateTime.UtcNow,
        ExpiresAt = DateTime.UtcNow.AddSeconds(durationSeconds),
        StudentId = student.Id,
        Token = SecurityUtils.GenerateSecureToken(sett.RefreshTokenLengthBytes),
        Type = StudentViewTokenType.Access
      };
      await Db.StudentViewTokens.AddAsync(refreshToken);
      await Db.SaveChangesAsync();

      string accessToken = GenerateJwtToken(
        student.Email,
        Roles.STUDENT_ROLE,
        sett.Student.AccessTokenExpiryMinutes);

      return new(accessToken, refreshToken.Token, true);
    }

    internal async Task<Tokens> LoginTeacherAsync(
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

      var refreshToken = new TeacherToken
      {
        TeacherId = teacher.Id,
        Type = rememberTeacherOverSessions ? TeacherToken.TokenType.RefreshPersistent : TeacherToken.TokenType.Refresh,
        Value = SecurityUtils.GenerateSecureToken(sett.RefreshTokenLengthBytes)
      };
      refreshToken.ExpirationDate = refreshToken.Type == TeacherToken.TokenType.Refresh
        ? DateTime.UtcNow.AddMinutes(sett.Teacher.SessionRefreshTokenExpiryInMinutes)
        : DateTime.UtcNow.AddMinutes(sett.Teacher.PersistentRefreshTokenExpiryInMinutes);
      Db.TeacherTokens.Add(refreshToken);
      await Db.SaveChangesAsync();

      string accessToken = GenerateJwtToken(
        teacher.Email,
        Roles.TEACHER_ROLE,
        sett.Teacher.AccessTokenExpiryMinutes);

      return new(accessToken, refreshToken.Value, refreshToken.Type == TeacherToken.TokenType.Refresh);
    }

    internal async System.Threading.Tasks.Task LogoutTeacherAsync(string refreshToken)
    {
      TeacherToken? token = await Db.TeacherTokens
        .FirstOrDefaultAsync(t => t.Value == refreshToken && t.Type == TeacherToken.TokenType.Refresh);
      if (token != null)
      {
        Db.TeacherTokens.Remove(token);
        await Db.SaveChangesAsync();
      }
      await FlushTeacherExpiredTokensAsync();
    }

    internal async System.Threading.Tasks.Task LogoutStudentAsync(string refreshToken)
    {
      StudentViewToken? token = await Db.StudentViewTokens
        .FirstOrDefaultAsync(t => t.Token == refreshToken && t.Type == StudentViewTokenType.Access);

      if (token != null)
      {
        Db.StudentViewTokens.Remove(token);
        await Db.SaveChangesAsync();
      }

      await FlushExpiredStudentViewTokensAsync();
    }

    internal async System.Threading.Tasks.Task FlushTeacherExpiredTokensAsync()
    {
      var utcNow = DateTime.UtcNow;
      var expiredTokens = Db.TeacherTokens.Where(t => t.ExpirationDate < utcNow);
      Db.TeacherTokens.RemoveRange(expiredTokens);
      await Db.SaveChangesAsync();
    }

    private async System.Threading.Tasks.Task FlushExpiredStudentViewTokensAsync()
    {
      var utcNow = DateTime.UtcNow;
      var expiredTokens = Db.StudentViewTokens.Where(t => t.ExpiresAt < utcNow);
      Db.StudentViewTokens.RemoveRange(expiredTokens);
      await Db.SaveChangesAsync();
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

    private bool IsPasswordRequirementFulfilled(string password)
    {
      var passwordRegex = new Regex(sett.Teacher.PasswordRegex, RegexOptions.Compiled);
      if (string.IsNullOrWhiteSpace(password)) return false;
      return passwordRegex.IsMatch(password);
    }

    private string GenerateJwtToken(string email, string roleName, int expiratonInMinutes)
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

    internal async System.Threading.Tasks.Task InvokeTeacherPasswordResetProcedure(string email)
    {
      Teacher teacher = await Db.Teachers
        .FirstOrDefaultAsync(t => t.Email == email)
        ?? throw new Exceptions.BadData.NotFound.EntityNotFoundException<Teacher>(email);

      await Db.TeacherTokens
        .Where(q => q.Type == TeacherToken.TokenType.PasswordReset && q.TeacherId == teacher.Id)
        .ExecuteDeleteAsync();

      TeacherToken resetToken = new()
      {
        ExpirationDate = DateTime.UtcNow.AddHours(1), //TODO to config
        TeacherId = teacher.Id,
        Type = TeacherToken.TokenType.PasswordReset,
        Value = SecurityUtils.GenerateSecureToken(sett.Teacher.PasswordResetTokenLength),
      };
      Db.TeacherTokens.Add(resetToken);
      await Db.SaveChangesAsync();

      await SendResetPasswordEmail(teacher.Email, resetToken.Value);
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

    internal async System.Threading.Tasks.Task StudentViewForgetAllRefreshsTokenAsync(string refreshToken)
    {
      var tokenEntity = await Db.StudentViewTokens
        .Include(q => q.Student)
        .FirstOrDefaultAsync(q => q.Token == refreshToken && q.Type == StudentViewTokenType.Access)
        ?? throw new InvalidCredentialsException();

      var tokens = Db.StudentViewTokens
        .Where(q => q.StudentId == tokenEntity.StudentId && q.Type == StudentViewTokenType.Access);
      Db.StudentViewTokens.RemoveRange(tokens);
      await Db.SaveChangesAsync();
    }

    internal async Task<Tokens> RefreshTeacherAsync(string refreshToken)
    {
      if (refreshToken.Length == 0)
        throw new InvalidCredentialsException();

      TeacherToken? token = await Db.TeacherTokens
          .Include(t => t.Teacher)
          .FirstOrDefaultAsync(t => t.Value == refreshToken &&
            (t.Type == TeacherToken.TokenType.Refresh || t.Type == TeacherToken.TokenType.RefreshPersistent))
          ?? throw new InvalidCredentialsException();

      if (token.ExpirationDate < DateTime.UtcNow)
      {
        await FlushTeacherExpiredTokensAsync();
        throw new InvalidCredentialsException();
      }

      token.Value = SecurityUtils.GenerateSecureToken(sett.RefreshTokenLengthBytes);
      token.ExpirationDate = token.Type == TeacherToken.TokenType.Refresh
        ? DateTime.UtcNow.AddMinutes(sett.Teacher.SessionRefreshTokenExpiryInMinutes)
        : DateTime.UtcNow.AddMinutes(sett.Teacher.PersistentRefreshTokenExpiryInMinutes);
      await Db.SaveChangesAsync();

      string accessToken = GenerateJwtToken(
        token.Teacher.Email,
        Roles.TEACHER_ROLE,
        sett.Teacher.AccessTokenExpiryMinutes);

      Tokens ret = new(
        accessToken,
        token.Value,
        token.Type == TeacherToken.TokenType.Refresh);
      return ret;
    }

    internal async Task<string> GenerateStudentAccessTokenAsync(string refreshToken)
    {
      var tokenEntity = await Db.StudentViewTokens
        .Include(q => q.Student)
        .FirstOrDefaultAsync(q => q.Token == refreshToken && q.Type == StudentViewTokenType.Access)
        ?? throw new InvalidCredentialsException();

      if (tokenEntity.ExpiresAt < DateTime.UtcNow)
      {
        await FlushExpiredStudentViewTokensAsync();
        throw new InvalidCredentialsException();
      }

      string accessToken = GenerateJwtToken(
        tokenEntity.Student.Number,
        Roles.STUDENT_ROLE,
        sett.Student.AccessTokenExpiryMinutes);

      return accessToken;
    }

    internal async System.Threading.Tasks.Task ResetPasswordAsync(string tokenValue, string email, string password)
    {
      TeacherToken token = await Db.TeacherTokens
        .Include(q => q.Teacher)
        .FirstOrDefaultAsync(q => q.Value == tokenValue && q.Type == TeacherToken.TokenType.PasswordReset)
        ?? throw new InvalidTokenException(InvalidTokenException.ETokenType.Validation, InvalidTokenException.EInvalidationType.NotFound);

      Teacher teacher = token.Teacher;
      if (teacher.Email != email)
        throw new InvalidTokenException(InvalidTokenException.ETokenType.Validation, InvalidTokenException.EInvalidationType.InvalidOwner);

      Db.TeacherTokens.Remove(token);
      await Db.SaveChangesAsync();

      if (token.ExpirationDate < DateTime.UtcNow) //TODO add token creation datetime test too
        throw new InvalidTokenException(InvalidTokenException.ETokenType.Validation, InvalidTokenException.EInvalidationType.Expired);

      await SetPasswordAsync(teacher.Id, password);
    }

    internal async Task<string> GenerateAttendanceDaySelfSignTokenAsync(AttendanceDaySelfSign adss)
    {
      int attendanceDaySelfSignId = adss.Id;
      Student student = adss.Student;
      AttendanceDay atd = adss.AttendanceDay;
      Attendance att = atd.Attendance;
      Course c = att.Course;

      string pureToken = SecurityUtils.GenerateSecureToken(sett.Student.AttendanceDaySelfSignTokenLengtBytes);
      string finalToken = $"{attendanceDaySelfSignId}_{pureToken}";

      var entity = new StudentViewToken()
      {
        CreatedAt = DateTime.UtcNow,
        ExpiresAt = DateTime.UtcNow.AddMinutes(sett.Student.AttendanceDaySelfSignTokenExpiryInMinutes),
        Token = finalToken,
        StudentId = student.Id,
        Type = StudentViewTokenType.AttendanceDaySelfSign
      };
      await Db.StudentViewTokens.AddAsync(entity);
      await Db.SaveChangesAsync();

      await SendValidationRequestEmailForAttendanceDaySelfSign(student.Email, c, att, atd, finalToken);

      return finalToken;
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
        <p><a href="{{feUrl}}/self/for-day/{{token}}/verify">Potvrdit docházku na kurzu</a></p>
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

    internal async Task<(int, int)> ApplyAttendanceDaySelfSignTokenAsync(string tokenString)
    {
      static (int, string) splitSelfSignIdAndToken(string tokenString)
      {
        int index = tokenString.IndexOf('_');
        string idString = tokenString.Substring(0, index);
        int id = int.Parse(idString);
        string newToken = tokenString.Substring(index + 1);
        return (id, newToken);
      }

      int id;
      string pureTokenString;
      (id, pureTokenString) = splitSelfSignIdAndToken(tokenString);

      StudentViewToken? token = await Db.StudentViewTokens
        .FirstOrDefaultAsync(q => q.Token == tokenString && q.Type == StudentViewTokenType.AttendanceDaySelfSign)
        ?? throw new InvalidTokenException(InvalidTokenException.ETokenType.Validation, InvalidTokenException.EInvalidationType.NotFound);

      DateTime utcNow = DateTime.UtcNow;
      if (utcNow < token.CreatedAt || token.ExpiresAt < utcNow)
      {
        logger.LogWarning(
          "Student login token expired: {TokenId} for student {StudentId}, token time {TokenCreatedAt}-{TokenExpiresAt}, current time {CurrentUtc}",
          token.Id, token.StudentId, token.CreatedAt, token.ExpiresAt, DateTime.UtcNow);
        throw new InvalidTokenException(InvalidTokenException.ETokenType.Validation, InvalidTokenException.EInvalidationType.Expired);
      }

      Db.StudentViewTokens.Remove(token);
      await Db.SaveChangesAsync();

      return (id, token.StudentId);
    }
  }
}
