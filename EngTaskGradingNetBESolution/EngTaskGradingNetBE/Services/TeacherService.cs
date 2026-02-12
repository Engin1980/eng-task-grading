
using EngTaskGradingNetBE.Exceptions;
using EngTaskGradingNetBE.Exceptions.BadData.Duplicate;
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

    internal async Task<Teacher> GetAsync(int teacherId)
    {
      return await Db.Teachers.FirstOrDefaultAsync(q => q.Id == teacherId)
        ?? throw new Exceptions.BadData.NotFound.EntityNotFoundException<Teacher>(teacherId);
    }

    internal async Task<Teacher> Create(Teacher teacher)
    {
      if (Db.Teachers.Any(t => t.Email == teacher.Email))
        throw new TeacherEmailAlreadyRegisteredException(teacher.Email);

      teacher.IsActive = false;
      teacher.PasswordHash = string.Empty;

      Db.Teachers.Add(teacher);
      await Db.SaveChangesAsync();
      return teacher;
    }

    internal async System.Threading.Tasks.Task SetActiveAsync(int teacherId)
    {
      Teacher teacher = await Db.Teachers.FirstOrDefaultAsync(t => t.Id == teacherId)
        ?? throw new Exceptions.BadData.NotFound.EntityNotFoundException<Teacher>(teacherId);

      teacher.IsActive = true;
      await Db.SaveChangesAsync();
    }

    internal async Task<Teacher> GetByEmailAsync(string email)
    {
      return await Db.Teachers.FirstOrDefaultAsync(q => q.Email == email)
        ?? throw new Exceptions.BadData.NotFound.EntityNotFoundException<Teacher>(email);
    }

    internal async Task<Teacher> GetByIdAsync(int teacherId)
    {
      return await Db.Teachers.FirstOrDefaultAsync(q => q.Id == teacherId)
        ?? throw new Exceptions.BadData.NotFound.EntityNotFoundException<Teacher>(teacherId);
    }
  }
}
