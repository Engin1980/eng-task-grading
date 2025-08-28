using EngTaskGradingNetBE.Exceptions;
using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models.DbModel;
using Microsoft.EntityFrameworkCore;

namespace EngTaskGradingNetBE.Services
{
  public class AuthService : DbContextBaseService
  {
    public AuthService(AppDbContext context) : base(context)
    {
    }

    public async Task<Teacher> ValidateTeacherCredentialsAsync(string email, string password)
    {
      var teacher = await Db.Teachers.FirstOrDefaultAsync(t => t.Email == email)
        ?? throw new EntityNotFoundException(typeof(Teacher), nameof(Teacher.Email), email);

      if (!VerifyPassword(password, teacher.PasswordHash))
        throw new InvalidCredentialsException();

      return teacher;
    }

    public async Task<Teacher> RegisterTeacher(string email, string password)
    {
      EAssert.Arg.IsNotEmpty(email, nameof(email));
      EAssert.Arg.IsNotEmpty(password, nameof(password));

      email = email.Trim().ToLower();
      
      var existingTeacher = await Db.Teachers.AnyAsync(t => t.Email == email);
      if (existingTeacher) throw new DuplicateEntityException(typeof(Teacher), $"Email '{email}' is already used.");

      var passwordHash = HashPassword(password);
      var newTeacher = new Teacher
      {
        Email = email,
        PasswordHash = passwordHash
      };
      Db.Teachers.Add(newTeacher);
      await Db.SaveChangesAsync();
      return newTeacher;
    }

    public static bool VerifyPassword(string password, string storedHash)
    {
      EAssert.Arg.IsNotEmpty(password, nameof(password));
      EAssert.Arg.IsNotEmpty(storedHash, nameof(storedHash));

      return BCrypt.Net.BCrypt.Verify(password, storedHash);
    }

    public static string HashPassword(string password)
    {
      EAssert.Arg.IsNotEmpty(password, nameof(password));

      return BCrypt.Net.BCrypt.HashPassword(password);
    }
  }
}
