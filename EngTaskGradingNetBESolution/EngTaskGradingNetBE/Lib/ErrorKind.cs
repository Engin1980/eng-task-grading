namespace EngTaskGradingNetBE.Lib;

public enum ErrorKind
{
  CourseNotFound,
  AttendanceNotFound,
  AttendanceDayNotFound,
  AttendanceDaySelfSignNotFound,
  AttendanceRecordNotFound,
  AttendanceValueNotFound,
}

public interface IErrorKind
{
  public string Key { get; }
}

public sealed class AlreadyExistsErrorKind : IErrorKind
{
  public static AlreadyExistsErrorKind TeacherEmailAlreadyExists { get; } = new AlreadyExistsErrorKind("TEACHER_EMAIL_ALREADY_EXISTS");
  public static AlreadyExistsErrorKind CourseCodeAlreadyExists { get; } = new AlreadyExistsErrorKind("COURSE_CODE_ALREADY_EXISTS");
  public string Key { get; private set; }
  private AlreadyExistsErrorKind(string key)
  {
    EAssert.Arg.IsNotEmpty(key, nameof(key));
    Key = key;
  }
}

public sealed class NotFoundErrorKind : IErrorKind
{
  public static NotFoundErrorKind CourseNotFound { get; } = new NotFoundErrorKind("COURSE_NOT_FOUND");
  public static NotFoundErrorKind AttendanceNotFound { get; } = new NotFoundErrorKind("ATTENDANCE_NOT_FOUND");
  public static NotFoundErrorKind AttendanceDayNotFound { get; } = new NotFoundErrorKind("ATTENDANCE_DAY_NOT_FOUND");
  public static NotFoundErrorKind AttendanceDaySelfSignNotFound { get; } = new NotFoundErrorKind("ATTENDANCE_DAY_SELF_SIGN_NOT_FOUND");
  public static NotFoundErrorKind AttendanceValueNotFound { get; } = new NotFoundErrorKind("ATTENDANCE_VALUE_NOT_FOUND");

  public string Key { get; private set; }
  public static NotFoundErrorKind TeacherNotFound { get; } = new NotFoundErrorKind("TEACHER_NOT_FOUND");
  public static NotFoundErrorKind StudentNotFound { get; } = new NotFoundErrorKind("STUDENT_NOT_FOUND");
  public static NotFoundErrorKind GradeNotFound { get; } = new NotFoundErrorKind("GRADE_NOT_FOUND");
  public static NotFoundErrorKind TaskNotFound { get; } = new NotFoundErrorKind("TASK_NOT_FOUND");

  private NotFoundErrorKind(string key)
  {
    this.Key = key;
  }
}

public sealed class CommonErrorKind : IErrorKind
{
  public static CommonErrorKind InvalidSelfSignKey { get; } = new CommonErrorKind("INVALID_SELF_SIGN_KEY");

  public string Key { get; private set; }
  private CommonErrorKind(string key)
  {
    EAssert.Arg.IsNotEmpty(key, nameof(key));
    Key = key;
  }
}

public sealed class InternalErrorKind : IErrorKind
{
  public static InternalErrorKind Unknown { get; } = new InternalErrorKind("UNKNOWN_INTERNAL_ERROR");
  public string Key { get; private set; }
  private InternalErrorKind(string key)
  {
    EAssert.Arg.IsNotEmpty(key, nameof(key));
    Key = key;
  }
}
