using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using EngTaskGradingNetBE.Models.Config;
using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;
using System.Linq;
using EngTaskGradingNetBE.Lib;

namespace EngTaskGradingNetBE.Services
{
  public class StudentViewService(
    AppDbContext context,
    ILogger<StudentViewService> logger,
    IEmailService emailService,
    AppSettingsService appSettingsService) : DbContextBaseService(context)
  {
    private readonly StudentSecuritySettings studentSecuritySettings =
      appSettingsService.GetSettings().Security.Student;

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

      var sett = appSettingsService.GetSettings().Security.Student;
      string token = SecurityUtils.GenerateSecureToken(sett.LoginTokenLengthBytes);
      await SaveLoginTokenToDatabaseAsync(student, token);
      SendEmailInBackground(student, token);
      logger.LogInformation("Requested access token for student {StudentNumber} generated & sending requested.", studentNumber);
    }

    private void SendEmailInBackground(Student student, string token)
    {
      string title = "Žádost o přístup do systému známek EngTaskGrading";
      string feUrl = appSettingsService.GetSettings().FrontEndBaseUrl;
      string body = $"""
        <p>Dobrý den,</p>
        <p>pro vaše osobní číslo byla přijata žádost o přístup na přehled známek do systému EngTaskGrading.</p>
        <p>Pokud jste o tento přístup požádali, klikněte na následující odkaz. Odkaz je platný {studentSecuritySettings.LoginTokenExpiryMinutes} minut od obdržení tohoto e-mailu.</p>
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

    private async System.Threading.Tasks.Task SaveLoginTokenToDatabaseAsync(Student student, string token)
    {
      StudentViewToken tokenEntity = new()
      {
        CreatedAt = DateTime.UtcNow,
        ExpiresAt = DateTime.UtcNow.AddMinutes(studentSecuritySettings.LoginTokenExpiryMinutes),
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

    internal async Task<List<Course>> GetStudentCoursesAsync(string studyNumber)
    {
      var student = await Db.Students.FirstOrDefaultAsync(q => q.Number == studyNumber);
      if (student == null) return new();

      var grades = await Db.Grades
        .Include(q => q.Task).ThenInclude(q => q.Course)
        .Where(q => q.StudentId == student.Id)
        .ToListAsync();
      var courses = await Db.Courses
        .Where(q => q.Students.Contains(student))
        .ToListAsync(); ;

      var ret = grades
        .Select(q => q.Task)
        .Select(q => q.Course)
        .Union(courses)
        .Distinct()
        .ToList();
      return ret;
    }

    public record StudentCourseDetailResult(Student Student, Course Course, List<Grade> Grades, List<AttendanceRecord> AttendanceRecords
      );

    internal async Task<StudentCourseDetailResult> GetStudentCourseDetailAsync(string studyNumber, int courseId)
    {
      var student = await Db.Students
        .FirstOrDefaultAsync(q => q.Number == studyNumber)
        ?? throw new Exceptions.EntityNotFoundException(Lib.NotFoundErrorKind.StudentNotFound, $"StudyNumber == {studyNumber}");

      var courseWithTasks = await Db.Courses
        .Include(q => q.Tasks)
        .Include(q => q.Attendances).ThenInclude(q => q.Days)
        .FirstOrDefaultAsync(q => q.Id == courseId)
        ?? throw new Exceptions.EntityNotFoundException(Lib.NotFoundErrorKind.CourseNotFound, courseId);
      var grades = await Db.Grades
        .Where(q => q.StudentId == student.Id)
        .ToListAsync();

      var attendanceRecords = await Db.AttendanceRecords
        .Include(q => q.Value)
        .Where(q => q.StudentId == student.Id)
        .ToListAsync();

      StudentCourseDetailResult ret = new StudentCourseDetailResult(student, courseWithTasks, grades, attendanceRecords);
      return ret;
    }

  }
};
