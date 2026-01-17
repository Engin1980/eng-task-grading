using EngTaskGradingNetBE.Models.DbModel;

namespace EngTaskGradingNetBE.Exceptions.BadData.NotFound;

public class NotFoundException : BadDataException
{
  public enum InstanceType
  {
    UNKNOWN,
    Course,
    Attendance,
    AttendanceDay,
    Teacher,
    Student,
    FinalGrade,
    Grade,
    Task
  }

  public InstanceType Type { get; init; }

  public object? Identifier { get; init; }

  public NotFoundException(InstanceType type, object? identifier) : base($"Entity {type} not found ({identifier})")
  {
    Type = type;
    Identifier = identifier;
  }

  public NotFoundException(Type type, object? identifier) : this(ConvertTypeToInstanceType(type), identifier) { }

  private static InstanceType ConvertTypeToInstanceType(Type type)
  {
    InstanceType ret;

    if (type == typeof(Teacher))
      ret = InstanceType.Teacher;
    else if (type == typeof(Student))
      ret = InstanceType.Student;
    else if (type == typeof(Course))
      ret = InstanceType.Course;
    else if (type == typeof(Models.DbModel.Task))
      ret = InstanceType.Task;
    else if (type == typeof(Grade))
      ret = InstanceType.Grade;
    else if (type == typeof(FinalGrade))
      ret = InstanceType.FinalGrade;
    else if (type == typeof(Attendance))
      ret = InstanceType.Attendance;
    else if (type == typeof(AttendanceDay))
      ret = InstanceType.AttendanceDay;
    else
      ret = InstanceType.UNKNOWN;

    return ret;
  }
}
