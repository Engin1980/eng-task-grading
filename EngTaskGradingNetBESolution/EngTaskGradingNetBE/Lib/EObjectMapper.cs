namespace EngTaskGradingNetBE.Lib;

using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;

public static class EObjectMapper
{
  public static TeacherDto To(Teacher teacher)
  {
    return new TeacherDto(teacher.Id, teacher.Email);
  }

  public static List<TeacherDto> To(IEnumerable<Teacher> teachers)
  {
    return teachers.Select(To).ToList();
  }

  public static TaskDto To(Task task)
  {
    return new TaskDto(
      task.Id,
      task.Title ?? string.Empty,
      task.Keywords
    );
  }

  public static StudentDto To(Student student)
  {
    return new StudentDto(
      student.Id,
      student.Number,
      student.Email,
      student.Name,
      student.Surname
    );
  }

  public static GradeDto To(Grade grade)
  {
    return new GradeDto(
       grade.Id,
       grade.StudentId,
       grade.Value,
       grade.Comment
     );
  }

  public static CourseOverviewDto ToOverview(Course course)
  {
    return new CourseOverviewDto(
      course.Id,
      course.Code,
      course.Name,
      course.Students.Count,
      course.Tasks.Count
    );
  }
}