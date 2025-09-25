using Azure.Core;
using EngTaskGradingNetBE.Exceptions;
using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models.Config;
using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace EngTaskGradingNetBE.Services
{
  public class AuthService(
    AppDbContext context,
    IEmailService emailService,
    AppSettingsService appSettingsService) : DbContextBaseService(context)
  {
    private readonly SecuritySettings sett = appSettingsService.GetSettings().Security;
    public record Tokens(string AccessToken, string RefreshToken);

    internal async Task<Tokens> StudentViewVerifyAsync(string loginToken, int durationSeconds)
    {
      var refreshTokenEntity = await Db.StudentViewTokens
        .Include(q => q.Student)
        .FirstOrDefaultAsync(q => q.Token == loginToken && q.Type == StudentViewTokenType.Login);
      if (refreshTokenEntity == null)
        throw new Exceptions.StudentTokenInvalidException("Illegal token.");

      Db.StudentViewTokens.Remove(refreshTokenEntity);
      await Db.SaveChangesAsync();
      if (refreshTokenEntity.ExpiresAt < DateTime.Now)
      {
        throw new Exceptions.StudentTokenInvalidException("Expired token.");
      }

      int studentId = refreshTokenEntity.StudentId;
      refreshTokenEntity = new StudentViewToken()
      {
        CreatedAt = DateTime.Now,
        ExpiresAt = DateTime.Now.AddSeconds(durationSeconds),
        StudentId = studentId,
        Token = SecurityUtils.GenerateSecureToken(sett.RefreshTokenLengthBytes),
        Type = StudentViewTokenType.Access
      };
      await Db.StudentViewTokens.AddAsync(refreshTokenEntity);
      await Db.SaveChangesAsync();

      string accessToken = GenerateJwtToken(
        refreshTokenEntity.Student.Email,
        Roles.STUDENT_ROLE,
        DateTime.Now.AddMinutes(sett.Student.AccessTokenExpiryMinutes));

      return new(accessToken, refreshTokenEntity.Token);
    }

    internal async Task<Tokens> LoginTeacherAsync(string email, string password)
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

      TeacherToken? refreshToken = await Db.TeacherTokens
        .FirstOrDefaultAsync(t => t.TeacherId == teacher.Id && t.Type == TeacherToken.TokenType.Refresh);

      if (refreshToken == null)
      {
        refreshToken = new TeacherToken
        {
          TeacherId = teacher.Id,
          Type = TeacherToken.TokenType.Refresh,
        };
        Db.TeacherTokens.Add(refreshToken);
      }
      refreshToken.Value = SecurityUtils.GenerateSecureToken(sett.RefreshTokenLengthBytes);
      refreshToken.ExpirationDate = DateTime.UtcNow.AddMinutes(sett.Teacher.RefreshTokenExpiryInMinutes);
      await Db.SaveChangesAsync();

      string accessToken = GenerateJwtToken(
        teacher.Email,
        Roles.TEACHER_ROLE,
        DateTime.UtcNow.AddMinutes(sett.Teacher.AccessTokenExpiryMinutes));

      return new(accessToken, refreshToken.Value);
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
      var now = DateTime.UtcNow;
      var expiredTokens = Db.TeacherTokens.Where(t => t.ExpirationDate < now);
      Db.TeacherTokens.RemoveRange(expiredTokens);
      await Db.SaveChangesAsync();
    }

    private async System.Threading.Tasks.Task FlushExpiredStudentViewTokensAsync()
    {
      var now = DateTime.UtcNow;
      var expiredTokens = Db.StudentViewTokens.Where(t => t.ExpiresAt < now);
      Db.StudentViewTokens.RemoveRange(expiredTokens);
      await Db.SaveChangesAsync();
    }

    internal async System.Threading.Tasks.Task SetPasswordAsync(int teacherId, string password)
    {
      string passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
      Teacher teacher = await Db.Teachers.FirstOrDefaultAsync(t => t.Id == teacherId)
        ?? throw new EntityNotFoundException(NotFoundErrorKind.TeacherNotFound, teacherId);

      teacher.PasswordHash = passwordHash;
      await Db.SaveChangesAsync();
    }

    private string GenerateJwtToken(string email, string roleName, DateTime dateTime)
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
        Expires = dateTime,
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

    internal async System.Threading.Tasks.Task InvokePasswordResetProcedure(string email)
    {
      Teacher teacher = await Db.Teachers
        .FirstOrDefaultAsync(t => t.Email == email)
        ?? throw new EntityNotFoundException(NotFoundErrorKind.TeacherNotFound, "email", email);

      var deprecated = Db.TeacherTokens
        .Where(q => q.Type == TeacherToken.TokenType.PasswordReset && q.TeacherId == teacher.Id);
      Db.TeacherTokens.RemoveRange(deprecated);

      TeacherToken resetToken = new()
      {
        ExpirationDate = DateTime.UtcNow.AddHours(1),
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
      string feUrl = appSettingsService.GetSettings().FrontEndBaseUrl;
      string body = $"""
        <p>Dobrý den,</p>
        <p>pro váš účet byla přijata žádost o obnovení hesla do systému EngTaskGrading.</p>
        <p>Pokud jste o toto obnovení požádali, klikněte na následující odkaz. Odkaz je platný 1 hodinu od obdržení tohoto e-mailu.</p>
        <p><a href="{feUrl}/auth/resetPassword/{token}">Obnovit heslo do systému známek EngTaskGrading</a></p>
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

    internal async System.Threading.Tasks.Task<Tokens> RefreshTeacherAsync(string refreshToken)
    {
      TeacherToken? token = await Db.TeacherTokens
          .Include(t => t.Teacher)
          .FirstOrDefaultAsync(t => t.Value == refreshToken || t.Type == TeacherToken.TokenType.Refresh)
          ?? throw new InvalidCredentialsException();

      if (token.ExpirationDate < DateTime.UtcNow)
      {
        await FlushTeacherExpiredTokensAsync();
        throw new InvalidCredentialsException();
      }

      // update the current refresh token with new values
      refreshToken = SecurityUtils.GenerateSecureToken(sett.RefreshTokenLengthBytes);
      token.Value = refreshToken;
      token.ExpirationDate = DateTime.Now.AddMinutes(sett.Teacher.RefreshTokenExpiryInMinutes);
      await Db.SaveChangesAsync();

      string accessToken = GenerateJwtToken(
        token.Teacher.Email,
        Roles.TEACHER_ROLE,
        DateTime.UtcNow.AddMinutes(sett.Teacher.AccessTokenExpiryMinutes));

      Tokens ret = new(accessToken, refreshToken);
      return ret;
    }

    internal async Task<string> RefreshStudentAsync(string refreshToken)
    {
      var tokenEntity = await Db.StudentViewTokens
        .Include(q => q.Student)
        .FirstOrDefaultAsync(q => q.Token == refreshToken && q.Type == StudentViewTokenType.Access);
      if (tokenEntity == null)
        throw new InvalidCredentialsException();
      if (tokenEntity.ExpiresAt < DateTime.Now)
      {
        await FlushExpiredStudentViewTokensAsync();
        throw new InvalidCredentialsException();
      }

      string accessToken = GenerateJwtToken(
        tokenEntity.Student.Number,
        Roles.STUDENT_ROLE,
        DateTime.UtcNow.AddMinutes(sett.Student.AccessTokenExpiryMinutes));

      return accessToken;
    }
  }
}
