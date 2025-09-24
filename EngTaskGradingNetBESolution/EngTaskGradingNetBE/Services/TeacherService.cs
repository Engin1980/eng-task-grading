
using EngTaskGradingNetBE.Exceptions;
using EngTaskGradingNetBE.Models.DbModel;
using Microsoft.EntityFrameworkCore;

namespace EngTaskGradingNetBE.Services
{
  public class TeacherService(AppDbContext context) : DbContextBaseService(context)
  {
    internal async Task<IEnumerable<Teacher>> GetAllTeachersAsync()
    {
      return await Db.Teachers.ToListAsync();
    }

    internal async Task<Teacher> GetAsync(int id)
    {
      return await Db.Teachers.FirstOrDefaultAsync(q => q.Id == id) ?? throw new EntityNotFoundException(Lib.NotFoundErrorKind.TeacherNotFound, id);
    }

    internal async Task<Teacher> Create(Teacher teacher)
    {
      if (Db.Teachers.Any(t => t.Email == teacher.Email))
        throw new DuplicateEntityException(Lib.AlreadyExistsErrorKind.TeacherEmailAlreadyExists, teacher.Email);

      teacher.IsActive = false;
      teacher.PasswordHash = string.Empty;

      Db.Teachers.Add(teacher);
      await Db.SaveChangesAsync();
      return teacher;
    }

    internal async System.Threading.Tasks.Task SetActiveAsync(int teacherId)
    {
      Teacher teacher = await Db.Teachers.FirstOrDefaultAsync(t => t.Id == teacherId)
        ?? throw new EntityNotFoundException(Lib.NotFoundErrorKind.TeacherNotFound, teacherId);

      teacher.IsActive = true;
      await Db.SaveChangesAsync();
    }

    internal async Task<Teacher> GetByEmailAsync(string email)
    {
      return await Db.Teachers.FirstOrDefaultAsync(q => q.Email == email)
        ?? throw new EntityNotFoundException(Lib.NotFoundErrorKind.TeacherNotFound, "email", email);
    }
  }
}
