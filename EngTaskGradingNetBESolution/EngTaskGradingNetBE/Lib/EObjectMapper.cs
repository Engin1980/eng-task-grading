namespace EngTaskGradingNetBE.Lib;

using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;

public static class EObjectMapper
{
  public static TeacherDto To(Teacher teacher) => new(teacher.Id, teacher.Email);


  public static Grade From(GradeCreateDto gradeDto, DateTime date) => new()
  {
    TaskId = gradeDto.TaskId,
    StudentId = gradeDto.StudentId,
    Value = gradeDto.Value,
    Date = date,
    Comment = gradeDto.Comment
  };
  public static GradeDto To(Grade grade) => new(grade.Id, grade.TaskId, grade.StudentId, grade.Value, grade.Date, grade.Comment);

  public static CourseDto To(Course course) => new(course.Id, course.Code, course.Name, course.Students?.Count ?? -1, course.Tasks?.Count ?? -1);

  public static Course From(CourseCreateDto courseDto) => new()
  {
    Code = courseDto.Code,
    Name = courseDto.Name
  };


  public static TaskDto To(Task task) => new(task.Id, task.Title, task.Keywords, task.Description, task.MinGrade);
  public static Task From(TaskCreateDto taskDto) => new()
  {
    Title = taskDto.Title,
    Description = taskDto.Description,
    Keywords = taskDto.Keywords,
    MinGrade = taskDto.MinGrade
  };

  public static StudentDto To(Student student) => new(
    student.Id, student.Number, student.Email, student.Name, student.Surname,
    student.UserName, student.StudyProgram, student.StudyForm);
  public static Student From(StudentCreateDto studentDto) => new()
  {
    Number = studentDto.Number,
    Email = studentDto.Email,
    Name = studentDto.Name,
    Surname = studentDto.Surname,
    UserName = studentDto.UserName,
    StudyProgram = studentDto.StudyProgram,
    StudyForm = studentDto.StudyForm
  };

  internal static Grade From(GradeUpdateDto gradeDto)
  {
    return new Grade()
    {
      Value = gradeDto.Value,
      Comment = gradeDto.Comment
    };
  }

  public static AppLogDto To(AppLog log) => new(log.Id, log.Message, log.MessageTemplate, log.Level, log.TimeStamp, log.Exception, log.Properties);
}