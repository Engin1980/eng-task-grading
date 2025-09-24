using Azure.Core;
using EngTaskGradingNetBE.Exceptions;
using EngTaskGradingNetBE.Lib;
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
    public record TokenAndTeacher(Tokens Tokens, Teacher Teacher);

    public record Tokens(string AccessToken, string RefreshToken);

    internal async Task<TokenAndTeacher> LoginAsync(string email, string password)
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
      refreshToken.Value = GenerateRandomToken(32);
      refreshToken.ExpirationDate = DateTime.UtcNow.AddSeconds(60 * 60 * 8); // 8 hours
      await Db.SaveChangesAsync();

      string accessToken = GenerateJwtToken(
        teacher.Email,
        "ROLE_TEACHER", //TODo resolve
        DateTime.UtcNow.AddSeconds(60 * 5)); // 5 minutes //TODO make configurable

      return new(new(accessToken, refreshToken.Value), teacher);
    }

    internal async System.Threading.Tasks.Task LogoutAsync(string refreshToken)
    {
      TeacherToken? token = await Db.TeacherTokens
        .FirstOrDefaultAsync(t => t.Value == refreshToken && t.Type == TeacherToken.TokenType.Refresh);
      if (token != null)
      {
        Db.TeacherTokens.Remove(token);
        await Db.SaveChangesAsync();
      }
      await FlushExpiredTokensAsync();
    }

    internal async System.Threading.Tasks.Task FlushExpiredTokensAsync()
    {
      var now = DateTime.UtcNow;
      var expiredTokens = Db.TeacherTokens.Where(t => t.ExpirationDate < now);
      Db.TeacherTokens.RemoveRange(expiredTokens);
      await Db.SaveChangesAsync();
    }

    internal async Task<Tokens> RefreshAsync(string refreshToken)
    {
      TeacherToken token = await Db.TeacherTokens
        .Include(t => t.Teacher)
        .FirstOrDefaultAsync(t => t.Value == refreshToken || t.Type == TeacherToken.TokenType.Refresh)
        ?? throw new InvalidCredentialsException();
      if (token.ExpirationDate < DateTime.UtcNow)
      {
        await FlushExpiredTokensAsync();
        throw new InvalidCredentialsException();
      }

      refreshToken = GenerateRandomToken(32);
      token.Value = refreshToken;
      token.ExpirationDate = DateTime.Now.AddSeconds(60 * 60 * 8);
      await Db.SaveChangesAsync();

      string accessToken = GenerateJwtToken(
        token.Teacher.Email,
        "ROLE_TEACHER",
        DateTime.Now.AddSeconds(60 * 5));

      Tokens ret = new Tokens(accessToken, refreshToken);
      return ret;
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
      var jwtKey = appSettingsService.GetSettings().Security.Teacher.AccessTokenJwtSecretKey;
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

    private string GenerateRandomToken(int length)
    {
      const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      var data = new byte[length];
      using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
      {
        rng.GetBytes(data);
      }
      var result = new char[length];
      for (int i = 0; i < length; i++)
      {
        result[i] = chars[data[i] % chars.Length];
      }
      return new string(result);
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
        Value = GenerateRandomToken(128),
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
  }
}
