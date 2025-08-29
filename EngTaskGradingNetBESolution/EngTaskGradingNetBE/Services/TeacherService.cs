
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
      return await Db.Teachers.FirstOrDefaultAsync(q => q.Id == id) ?? throw new Exceptions.EntityNotFoundException(typeof(Teacher), id);
    }
  }
}
