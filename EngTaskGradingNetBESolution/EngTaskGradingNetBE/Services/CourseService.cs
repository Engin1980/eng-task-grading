using EngTaskGradingNetBE.Models.DbModel;
using Microsoft.EntityFrameworkCore;

namespace EngTaskGradingNetBE.Services
{
  public class CourseService(AppDbContext context) : DbContextBaseService(context)
  {
    public async Task<List<Course>> GetAllAsync()
    {
      return await Db.Courses
        .Include(q => q.Tasks)
        .Include(q => q.Students)
        .Include(q => q.Attendances)
        .ToListAsync();
    }

    public async Task<Course> GetByIdAsync(int courseId)
    {
      return await Db.Courses
        .Where(q => q.Id == courseId)
        .Include(q => q.Tasks)
        .Include(q => q.Students)
        .Include(q => q.Attendances)
        .FirstOrDefaultAsync()
        ?? throw new Exceptions.BadData.NotFound.EntityNotFoundException<Course>(courseId);
    }

    public async Task<Course> CreateAsync(Course course)
    {
      if (Db.Courses.Any(c => c.Code == course.Code))
      {
        throw new Exceptions.BadData.Duplicate.DuplicateCourseCodeException(course.Code);
      }

      Db.Courses.Add(course);
      await Db.SaveChangesAsync();
      return course;
    }

    public async System.Threading.Tasks.Task DeleteAsync(int courseId)
    {
      var course = await Db.Courses.FindAsync(courseId);
      if (course == null) return;
      Db.Courses.Remove(course);
      await Db.SaveChangesAsync();
    }

    public async System.Threading.Tasks.Task AssignStudentsAsync(IEnumerable<int> studentIds, int courseId)
    {
      var course = await Db.Courses
          .Include(c => c.Students)
          .FirstOrDefaultAsync(c => c.Id == courseId)
          ?? throw new Exceptions.BadData.NotFound.EntityNotFoundException<Course>(courseId);

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
    public async System.Threading.Tasks.Task AssignStudent(int courseId, int studentId)
    {
      var course = await Db.Courses
          .Include(c => c.Students)
          .FirstOrDefaultAsync(c => c.Id == courseId)
          ?? throw new Exceptions.BadData.NotFound.EntityNotFoundException<Course>(courseId);
      var student = await Db.Students.FindAsync(studentId)
        ?? throw new Exceptions.BadData.NotFound.EntityNotFoundException<Student>(studentId);

      if (course.Students.Any(s => s.Id == student.Id) == false)
      {
        course.Students.Add(student);
        await Db.SaveChangesAsync();
      }
    }

    public async System.Threading.Tasks.Task WithholdStudentAsync(int courseId, int studentId)
    {
      var course = await Db.Courses
          .Include(c => c.Students)
          .FirstOrDefaultAsync(c => c.Id == courseId)
          ?? throw new Exceptions.BadData.NotFound.EntityNotFoundException<Course>(courseId);
      var student = await Db.Students.FindAsync(studentId)
        ?? throw new Exceptions.BadData.NotFound.EntityNotFoundException<Student>(studentId);
      if (course.Students.Any(s => s.Id == student.Id))
      {
        course.Students.Remove(student);
        await Db.SaveChangesAsync();
      }
    }

    public async Task<Course> UpdateAsync(int courseId, Course updatedCourse)
    {
      var existingCourse = await Db.Courses.FirstOrDefaultAsync(q => q.Id == courseId)
        ?? throw new Exceptions.BadData.NotFound.EntityNotFoundException<Course>(courseId);

      existingCourse.Name = updatedCourse.Name;
      existingCourse.Code = updatedCourse.Code;

      await Db.SaveChangesAsync();
      return existingCourse;
    }

    internal async Task<Course> GetForOverview(int courseId)
    {
      Course ret = await Db.Courses
        .Where(q => q.Id == courseId)
        .Include(q => q.Tasks)
        .Include(q => q.Students)
          .ThenInclude(s => s.Grades)
            .ThenInclude(g => g.Task)
        .Include(q => q.Attendances)
        .ThenInclude(a => a.Days)
          .ThenInclude(a => a.Records)
            .ThenInclude(ar => ar.Student)
        .Include(q => q.Attendances)
          .ThenInclude(a => a.Days)
            .ThenInclude(a => a.Records)
              .ThenInclude(ar => ar.Value)
        .Include(q => q.FinalGrades)
          .ThenInclude(q => q.Student)
        .AsSplitQuery()
        .FirstOrDefaultAsync()
        ?? throw new Exceptions.BadData.NotFound.EntityNotFoundException<Course>(courseId);
      return ret;
    }

    internal async Task<FinalGrade> SetFinalGradeAsRecordedAsync(int finalGradeId)
    {
      FinalGrade finalGrade = await Db.FinalGrades.FirstOrDefaultAsync(q => q.Id == finalGradeId)
        ?? throw new Exceptions.BadData.NotFound.EntityNotFoundException<FinalGrade>(finalGradeId);
      finalGrade.RecordedDateTime = DateTime.UtcNow;
      await Db.SaveChangesAsync();
      return finalGrade;
    }

    internal async Task<FinalGrade> SetFinalGradeAsUnrecordedAsync(int finalGradeId)
    {
      FinalGrade finalGrade = await Db.FinalGrades.FirstOrDefaultAsync(q => q.Id == finalGradeId)
        ?? throw new Exceptions.BadData.NotFound.EntityNotFoundException<FinalGrade>(finalGradeId);
      finalGrade.RecordedDateTime = null;
      await Db.SaveChangesAsync();
      return finalGrade;
    }

    internal async Task<FinalGrade> AddFinalGradeAsync(FinalGrade finalGrade)
    {
      var course = await Db.Courses
        .Include(q => q.FinalGrades)
        .FirstAsync(q => q.Id == finalGrade.CourseId);

      if (course.FinalGrades.Any(q => q.StudentId == finalGrade.StudentId))
        throw new Exceptions.BadData.Duplicate.DuplicateFinalGradeForCourseAndStudent(finalGrade.CourseId, finalGrade.StudentId);

      await Db.FinalGrades.AddAsync(finalGrade);
      await Db.SaveChangesAsync();

      return finalGrade;
    }

    internal async Task<FinalGrade> UpdateFinalGradeAsync(int finalGradeId, int value, string? comment)
    {
      FinalGrade finalGrade = await Db.FinalGrades.FirstOrDefaultAsync(q => q.Id == finalGradeId)
        ?? throw new Exceptions.BadData.NotFound.EntityNotFoundException<FinalGrade>(finalGradeId);
      finalGrade.Value = value;
      finalGrade.Comment = comment;
      finalGrade.RecordedDateTime = null;
      await Db.SaveChangesAsync();

      return finalGrade;
    }

    internal async System.Threading.Tasks.Task DeleteFinalGradeAsync(int finalGradeId)
    {
      FinalGrade finalGrade = await Db.FinalGrades.FirstOrDefaultAsync(q => q.Id == finalGradeId)
        ?? throw new Exceptions.BadData.NotFound.EntityNotFoundException<FinalGrade>(finalGradeId);
      Db.FinalGrades.Remove(finalGrade);
      await Db.SaveChangesAsync();
    }
  }
}
