using EngTaskGradingNetBE.Models.DbModel;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

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
    public async System.Threading.Tasks.Task CreateAsync(int courseId, Models.DbModel.Task task)
    {
      task.CourseId = courseId;
      task.CourseId = courseId;
      await Db.Tasks.AddAsync(task);
      await Db.SaveChangesAsync();
    }

    public async Task<Models.DbModel.Task> GetByIdAsync(int taskId)
    {
      return await Db.Tasks.FindAsync(taskId)
        ?? throw new Exceptions.BadData.NotFound.EntityNotFoundException<Models.DbModel.Task>(taskId);
    }

    public async Task<Models.DbModel.Task> UpdateAsync(int taskId, Models.DbModel.Task updatedTask)
    {
      var existingTask = await Db.Tasks.FirstOrDefaultAsync(q => q.Id == taskId)
        ?? throw new Exceptions.BadData.NotFound.EntityNotFoundException<Models.DbModel.Task>(taskId);

      existingTask.Title = updatedTask.Title;
      existingTask.Description = updatedTask.Description;
      existingTask.Keywords = updatedTask.Keywords;
      existingTask.MaxGrade = updatedTask.MaxGrade;
      existingTask.MinGrade = updatedTask.MinGrade;
      existingTask.Aggregation = updatedTask.Aggregation;

      await Db.SaveChangesAsync();
      return existingTask;
    }

    public async System.Threading.Tasks.Task DeleteAsync(int taskId, bool mustExist = false)
    {
      var task = await Db.Tasks.FirstOrDefaultAsync(q => q.Id == taskId);
      if (task == null)
        if (mustExist) throw new Exceptions.BadData.NotFound.EntityNotFoundException<Models.DbModel.Task>(taskId);
        else return;
      Db.Tasks.Remove(task);
      await Db.SaveChangesAsync();
    }
  }
}
