using EngTaskGradingNetBE.Models.DbModel;

namespace EngTaskGradingNetBE.Services
{
  public class CourseService(AppDbContext context, ILogger<CourseService> logger) : DbContextBaseService(context)
  {
    public async Task<List<Course>> GetAllCoursesAsync()
    {
      return await Db.Courses.ToListAsync();
    }

    public async Task<Course> GetCourseByIdAsync(int courseId)
    {
      return await Db.Courses.FindAsync(courseId) ?? throw new Exceptions.EntityNotFoundException(typeof(Course), courseId);
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

    public async Task<bool> DeleteCourseAsync(int courseId)
    {
      var course = await Context.Courses.FindAsync(courseId);
      if (course == null)
      {
        return false;
      }
      Context.Courses.Remove(course);
      await Context.SaveChangesAsync();
      return true;
    }

  }
}
