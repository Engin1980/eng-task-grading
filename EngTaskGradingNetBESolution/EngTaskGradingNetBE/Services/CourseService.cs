using EngTaskGradingNetBE.Models.DbModel;
using Microsoft.EntityFrameworkCore;

namespace EngTaskGradingNetBE.Services
{
  public class CourseService(AppDbContext context, ILogger<CourseService> logger) : DbContextBaseService(context)
  {
    public async Task<List<Course>> GetAllCoursesAsync()
    {
      return await Db.Courses
        .Include(q => q.Tasks)
        .Include(q => q.Students)
        .ToListAsync();
    }

    public async Task<Course> GetCourseByIdAsync(int courseId)
    {
      return await Db.Courses
        .Where(q => q.Id == courseId)
        .Include(q => q.Tasks)
        .Include(q => q.Students)
        .FirstOrDefaultAsync()
        ?? throw new Exceptions.EntityNotFoundException(typeof(Course), courseId);
    }

    public async Task<Course> CreateCourseAsync(Course course)
    {
      if (Db.Courses.Any(c => c.Code == course.Code))
      {
        throw new Exceptions.DuplicateEntityException(typeof(Course), $"Course with code '{course.Code}' already exists.");
      }

      Db.Courses.Add(course);
      await Db.SaveChangesAsync();
      return course;
    }

    public async System.Threading.Tasks.Task DeleteCourseAsync(int courseId)
    {
      var course = await Db.Courses.FindAsync(courseId);
      if (course == null) return;
      Db.Courses.Remove(course);
      await Db.SaveChangesAsync();
    }

    public async System.Threading.Tasks.Task AssignStudentsToCourseAsync(IEnumerable<int> studentIds, int courseId)
    {
      var course = await Db.Courses
          .Include(c => c.Students)
          .FirstOrDefaultAsync(c => c.Id == courseId);

      if (course == null)
        throw new Exceptions.EntityNotFoundException(typeof(Course), courseId);

      var studentsToAssign = await Db.Students
          .Where(s => studentIds.Contains(s.Id))
          .ToListAsync();

      foreach (var student in studentsToAssign)
      {
        if (!course.Students.Any(s => s.Id == student.Id))
        {
          course.Students.Add(student);
        }
      }

      await Db.SaveChangesAsync();
    }
  }
}
