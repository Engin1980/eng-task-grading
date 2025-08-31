using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace EngTaskGradingNetBE.Services
{
  public class GradeService(AppDbContext context) : DbContextBaseService(context)
  {
    internal async Task<List<Grade>> GetGradesByCourseAsync(int courseId)
    {
      var course = await Db.Courses.FindAsync(courseId) ?? throw new Exceptions.EntityNotFoundException(typeof(Course), courseId);
      var ret = await Db.Grades
        .Where(g => g.Task.CourseId == courseId)
        .ToListAsync();
      return ret;
    }

    internal async Task<Grade> InsertGradeAsync(int taskId, int studentId, int teacherId, int value, string? comment)
    {
      Grade grade = new()
      {
        TaskId = taskId,
        StudentId = studentId,
        AssignerTeacherId = teacherId,
        Value = value,
        Comment = comment,
        Date = DateTime.UtcNow
      };

      await Db.Grades.AddAsync(grade);
      await Db.SaveChangesAsync();
      return grade;
    }
  }
}
