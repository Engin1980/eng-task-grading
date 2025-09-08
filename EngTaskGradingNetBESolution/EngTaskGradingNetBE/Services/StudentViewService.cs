using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using EngTaskGradingNetBE.Models.Config;
using EngTaskGradingNetBE.Models.DbModel;

namespace EngTaskGradingNetBE.Services
{
  public class StudentViewService(
    Models.DbModel.AppDbContext context,
    ILogger<StudentViewService> logger,
    IEmailService emailService,
    IOptions<AppSettings> appSettings) : DbContextBaseService(context)
  {
    private readonly TokenSettings tokenSettings = appSettings.Value.Token;

    internal async System.Threading.Tasks.Task SendInvitationAsync(string studentNumber)
    {
      studentNumber = studentNumber.ToUpper().Trim();
      var student = await Db.Students.FirstOrDefaultAsync(q => q.Number == studentNumber);
      if (student == null)
      {
        logger.LogWarning("Requested access for student {StudentNumber}, but not in the database. Aborted.", studentNumber);
        return;
      }
      logger.LogInformation("Requested access for student {StudentNumber}, verified; will send invitation.", studentNumber);

      string token = GenerateSecureToken();
      await SaveAccessTokenToDatabaseAsync(student, token);
      await SendEmailAsync(student, token);
      logger.LogInformation("Requested access token for student {StudentNumber} generated & sending requested.", studentNumber);
    }

    private async System.Threading.Tasks.Task SendEmailAsync(Student student, string token)
    {
      string title = "Žádost o přístup do systému známek EngTaskGrading";
      string feUrl = appSettings.Value.FrontEndBaseUrl;
      string body = $"""
        <p>Dobrý den,</p>
        <p>pro vaše osobní číslo byla přijata žádost o přístup na přehled známek do systému EngTaskGrading.</p>
        <p>Pokud jste o tento přístup požádali, klikněte na následující odkaz. Odkaz je platný {tokenSettings.StudentLoginTokenExpiryMinutes} minut od obdržení tohoto e-mailu.</p>
        <p><a href="{feUrl}/studentView/verify/{token}">Přihlásit se do systému známek EngTaskGrading</a></p>
        <p>Pokud jste o tento přístup nepožádali, tento e-mail ignorujte, nikdo nebude mít přístup k vašim známkám.</p>
        <p>V případě dotazů prosím kontaktuje vyučujícího daného předmětu.</p>
        <p>Hezký den přeje tým EngTaskGrading.</p>
        """;
      try
      {
        logger.LogInformation("Enqueueing student-view invitation email for {Email}", student.Email);
        emailService.SendEmailInBackground(student.Email, title, body);
        logger.LogInformation("Student-view invitation email enqueued for {Email}", student.Email);
      }
      catch (Exception ex)
      {
        logger.LogError(ex, "Failed to enqueue student-view invitation email for {Email}", student.Email);
      }
    }

    private async System.Threading.Tasks.Task SaveAccessTokenToDatabaseAsync(Student student, string token)
    {
      StudentViewToken tokenEntity = new()
      {
        CreatedAt = DateTime.UtcNow,
        ExpiresAt = DateTime.UtcNow.AddMinutes(tokenSettings.StudentLoginTokenExpiryMinutes),
        StudentId = student.Id,
        Token = token,
        Type = StudentViewTokenType.Login
      };

      var existing = await Db.StudentViewTokens
        .Where(q => q.StudentId == student.Id && q.Type == StudentViewTokenType.Login)
        .ToListAsync();
      Db.StudentViewTokens.RemoveRange(existing);
      await Db.StudentViewTokens.AddAsync(tokenEntity);
      await Db.SaveChangesAsync();
    }

    private string GenerateSecureToken()
    {
      // Generate token with configurable length from appsettings.json
      byte[] tokenBytes = new byte[tokenSettings.StudentLoginTokenLengthBytes];
      using (var rng = RandomNumberGenerator.Create())
      {
        rng.GetBytes(tokenBytes);
      }

      // Convert to Base64 and make URL-safe by replacing problematic characters
      return Convert.ToBase64String(tokenBytes)
        .Replace('+', '-')
        .Replace('/', '_')
        .TrimEnd('=');
    }
  }
}
