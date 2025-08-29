using EngTaskGradingNetBE.Exceptions;
using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models.DbModel;
using Microsoft.EntityFrameworkCore;

namespace EngTaskGradingNetBE.Services
{
  public class AuthService(KeyCloakService keyCloakService, AppDbContext context) : DbContextBaseService(context)
  {
    public async Task<Teacher> RegisterTeacher(string email, string password)
    {
      EAssert.Arg.IsNotEmpty(email, nameof(email));
      EAssert.Arg.IsNotEmpty(password, nameof(password));

      email = email.Trim().ToLower();

      var existingTeacher = await Db.Teachers.AnyAsync(t => t.Email == email);
      if (existingTeacher) throw new DuplicateEntityException(typeof(Teacher), $"Email '{email}' is already used.");

      var newTeacher = new Teacher
      {
        Email = email,
      };
      Db.Teachers.Add(newTeacher);
      await Db.SaveChangesAsync();

      try
      {
        var token = await keyCloakService.GetAdminTokenAsync();
        await keyCloakService.CreateUserAsync(token, newTeacher.Id, newTeacher.Email, newTeacher.Email, password);
      }
      catch (Exception ex)
      {
        // rollback
        Db.Teachers.Remove(newTeacher);
        await Db.SaveChangesAsync();
        throw new Exception("Failed to create user in Keycloak.", ex);
      }

      return newTeacher;
    }
  }
}
