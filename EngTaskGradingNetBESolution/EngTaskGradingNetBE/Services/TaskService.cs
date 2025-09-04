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
    public async Task<Models.DbModel.Task> CreateAsync(int courseId, Models.DbModel.Task task)
    {
      task.CourseId = courseId;
      task.CourseId = courseId;
      await Db.Tasks.AddAsync(task);
      await Db.SaveChangesAsync();
      return task;
    }

    public async Task<Models.DbModel.Task> GetByIdAsync(int id)
    {
      return await Db.Tasks.FindAsync(id) ?? throw new Exceptions.EntityNotFoundException(typeof(Models.DbModel.Task), id);
    }

    public async Task<Models.DbModel.Task> UpdateAsync(int id, Models.DbModel.Task updatedTask)
    {
      var existingTask = await Db.Tasks.FirstOrDefaultAsync(q => q.Id == id)
        ?? throw new Exceptions.EntityNotFoundException(typeof(Models.DbModel.Task), id);
      
      existingTask.Title = updatedTask.Title;
      existingTask.Description = updatedTask.Description;
      existingTask.Keywords = updatedTask.Keywords;
      existingTask.MinGrade = updatedTask.MinGrade;
      
      await Db.SaveChangesAsync();
      return existingTask;
    }

    public async System.Threading.Tasks.Task DeleteAsync(int id, bool mustExist = false)
    {
      var task = await Db.Tasks.FirstOrDefaultAsync(q => q.Id == id);
      if (task == null)
        if (mustExist) throw new Exceptions.EntityNotFoundException(typeof(Models.DbModel.Task), id);
        else return;
      Db.Tasks.Remove(task);
      await Db.SaveChangesAsync();
    }
  }
}
