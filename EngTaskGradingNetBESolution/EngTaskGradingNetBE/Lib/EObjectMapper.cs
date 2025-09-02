namespace EngTaskGradingNetBE.Lib;

using EngTaskGradingNetBE.Controllers;
using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;
using System;

public static class EObjectMapper
{
  public static TeacherDto To(Teacher teacher)
  {
    return new TeacherDto(teacher.Id, teacher.Email);
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

  public static CourseDto ToDto(Course course)
  {
    return new CourseDto(
      course.Id,
      course.Code,
      course.Name,
      course.Students?.Count ?? -1,
      course.Tasks?.Count ?? -1
    );
  }

  internal static Course From(CourseCreateDto courseDto)
  {
    return new Course()
    {
      Code = courseDto.Code,
      Name = courseDto.Name
    };
  }
}