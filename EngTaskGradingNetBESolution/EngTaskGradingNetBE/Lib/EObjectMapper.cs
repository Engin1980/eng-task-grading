namespace EngTaskGradingNetBE.Lib;

using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;
using EngTaskGradingNetBE.Services;
using System.Collections.Generic;

public static class EObjectMapper
{
  public static TeacherDto To(Teacher teacher) => new(teacher.Id, teacher.Email);

  public static Task From(TaskUpdateDto dto) => new()
  {
    Aggregation = ConverTaskAggregationStringToEnum(dto.Aggregation),
    Description = dto.Description,
    Keywords = dto.Keywords,
    MinGrade = dto.MinGrade,
    Title = dto.Title
  };

  public static Grade From(GradeCreateDto gradeDto, DateTime date) => new()
  {
    TaskId = gradeDto.TaskId,
    StudentId = gradeDto.StudentId,
    Value = gradeDto.Value,
    Date = date,
    Comment = gradeDto.Comment
  };
  public static GradeDto To(Grade grade) => new(grade.Id, grade.TaskId, grade.StudentId, grade.Value, grade.Date, grade.Comment);

  public static CourseDto To(Course course) => new(course.Id, course.Code, course.Name, course.Students?.Count ?? -1, course.Tasks?.Count ?? -1, course.Attendances?.Count ?? -1);

  public static Course From(CourseCreateDto courseDto) => new()
  {
    Code = courseDto.Code,
    Name = courseDto.Name
  };


  public static TaskDto To(Task task) => new(task.Id, task.CourseId, task.Title, task.Keywords, task.Description, task.MinGrade, task.Aggregation.ToString());
  public static Task From(TaskCreateDto taskDto) => new()
  {
    Title = taskDto.Title,
    Description = taskDto.Description,
    Keywords = taskDto.Keywords,
    MinGrade = taskDto.MinGrade,
    Aggregation = ConverTaskAggregationStringToEnum(taskDto.Aggregation)
  };

  private static Task.AggregationType ConverTaskAggregationStringToEnum(string aggregation)
  {
    return aggregation.ToLower() switch
    {
      "min" => Task.AggregationType.Min,
      "max" => Task.AggregationType.Max,
      "avg" => Task.AggregationType.Avg,
      _ => Task.AggregationType.Last
    };
  }

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

  public static Attendance From(AttendanceCreateDto attendanceDto)
  {
    return new Attendance()
    {
      Title = attendanceDto.Title,
      MinWeight = attendanceDto.MinWeight
    };
  }

  public static AttendanceDto To(Attendance attendance)
    => new(attendance.Id, attendance.CourseId, attendance.Title, attendance.MinWeight, attendance.Days.OrderBy(q => q.Title).Select(To).ToList());

  public static AttendanceDay From(AttendanceDayCreateDto dto)
  {
    return new AttendanceDay()
    {
      Title = dto.Title
    };
  }
  public static AttendanceDay From(AttendanceDayUpdateDto dto)
  {
    return new AttendanceDay()
    {
      Title = dto.Title
    };
  }
  public static AttendanceDayDto To(AttendanceDay day) =>
    new(day.Id, day.Title, day.SelfAssignKey);

  internal static Attendance From(AttendanceUpdateDto attendanceDto)
  {
    return new Attendance()
    {
      Title = attendanceDto.Title,
      MinWeight = attendanceDto.MinWeight
    };
  }

  internal static AttendanceOverviewDto To(int attendanceId, Dictionary<Student, double> data)
  {
    AttendanceOverviewDto ret = new(
      attendanceId,
      data.Select(
        q => new KeyValuePair<StudentDto, double>(To(q.Key), q.Value))
      .ToDictionary());
    return ret;
  }

  internal static AttendanceValueDto To(AttendanceValue q)
  {
    return new AttendanceValueDto(q.Id, q.Title, q.Weight);
  }

  public static AttendanceRecordDto To(AttendanceRecord sa) => new AttendanceRecordDto(sa.Id, sa.StudentId, sa.AttendanceDayId, sa.AttendanceValueId);

  public static AttendanceDaySelfSignDto To(AttendanceDaySelfSign s) => new(s.Id, EObjectMapper.To(s.Student), s.CreationDateTime, s.IP);

  internal static Teacher From(TeacherCreateDto request)
  {
    return new Teacher()
    {
      Email = request.Email,
      PasswordHash = string.Empty,
      IsActive = false
    };
  }
}