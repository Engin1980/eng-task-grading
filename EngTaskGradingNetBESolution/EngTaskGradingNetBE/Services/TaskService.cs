using EngTaskGradingNetBE.Models.DbModel;
using Microsoft.EntityFrameworkCore;

namespace EngTaskGradingNetBE.Services
{
  public class TaskService(AppDbContext context) : DbContextBaseService(context)
  {
    public async Task<List<Models.DbModel.Task>> GetAllByCourseAsync(int courseId)
    {
      return await Db.Tasks
        .Where(t => t.CourseId == courseId)
        .ToListAsync();
    }
    public async Task<Models.DbModel.Task> CreateForCourseAsync(int courseId, Models.DbModel.Task task)
    {
      task.CourseId = courseId;
      task.CourseId = courseId;
      await Db.Tasks.AddAsync(task);
      await Db.SaveChangesAsync();
      return task;
    }

    internal async Task<Models.DbModel.Task> GetByIdAsync(int id)
    {
      return await Db.Tasks.FindAsync(id) ?? throw new Exceptions.EntityNotFoundException(typeof(Models.DbModel.Task), id);
    }
  }
}
