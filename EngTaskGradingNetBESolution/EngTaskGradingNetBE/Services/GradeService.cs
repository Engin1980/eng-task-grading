using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace EngTaskGradingNetBE.Services
{
  public class GradeService(AppDbContext context) : DbContextBaseService(context)
  {
    public record GradesByCourseResult(List<Models.DbModel.Task> Tasks, List<Student> Students, List<Grade> Grades);
    internal async Task<GradesByCourseResult> GetGradesByCourseAsync(int courseId)
    {
      var tasks = await Db.Tasks.Where(q => q.CourseId == courseId)
        .Include(q => q.Grades).ThenInclude(q => q.Student)
        .ToListAsync();
      var grades = tasks.SelectMany(q => q.Grades).ToList();
      var students = grades.Select(q => q.Student).Distinct().ToList();

      var ret = new GradesByCourseResult(tasks, students, grades);
      return ret;
    }

    public record GradesByTaskResult(Models.DbModel.Task Task, List<Student> Students, List<Grade> Grades);
    internal async Task<GradesByTaskResult> GetGradesByTaskAsync(int taskId)
    {
      var task = await Db.Tasks
        .Include(q => q.Course).ThenInclude(q => q.Students)
        .Include(q => q.Grades)
        .ThenInclude(q => q.Student)
        .FirstAsync(q => q.Id == taskId);
      var grades = task.Grades.ToList();
      var students = grades.Select(q => q.Student).Union(task.Course.Students).Distinct().ToList();

      var ret = new GradesByTaskResult(task, students, grades);
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

    public async Task<Grade> CreateAsync(Grade grade)
    {
      //TODO UPDATE later when logging is implemented
      grade.AssignerTeacher = await Db.Teachers.FirstAsync();
      await Db.Grades.AddAsync(grade);
      await Db.SaveChangesAsync();
      return grade;
    }

    public async System.Threading.Tasks.Task DeleteAsync(int gradeId, bool mustExist = false)
    {
      var grade = await Db.Grades.FirstOrDefaultAsync(q => q.Id == gradeId);
      if (grade == null)
        if (mustExist) throw new Exceptions.EntityNotFoundException(typeof(Grade), gradeId);
        else return;
      Db.Grades.Remove(grade);
      await Db.SaveChangesAsync();
    }

    public async Task<Grade> UpdateAsync(int id, Grade grade)
    {
      var existingGrade = await Db.Grades.FirstOrDefaultAsync(q => q.Id == id)
        ?? throw new Exceptions.EntityNotFoundException(typeof(Grade), id);

      existingGrade.Value = grade.Value;
      existingGrade.Comment = grade.Comment;

      await Db.SaveChangesAsync();
      return existingGrade;
    }
  }
}
