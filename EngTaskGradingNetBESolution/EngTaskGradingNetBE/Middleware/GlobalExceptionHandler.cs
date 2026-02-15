using EngTaskGradingNetBE.Exceptions;
using EngTaskGradingNetBE.Exceptions.BadData;
using EngTaskGradingNetBE.Exceptions.BadData.Common;
using EngTaskGradingNetBE.Exceptions.BadData.Duplicate;
using EngTaskGradingNetBE.Exceptions.BadData.NotFound;
using EngTaskGradingNetBE.Exceptions.Server;
using EngTaskGradingNetBE.Exceptions.Server.CloudflareTurnistille;
using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Services;
using System.Net;
using System.Text.Json;

namespace EngTaskGradingNetBE.Middleware
{
  public class GlobalExceptionHandler
  {
    public static class ErrorKeys
    {
      public const string INVALID_CREDENTIALS = "INVALID_CREDENTIALS";
      public const string INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR";
      public const string COURSE_DUPLICATE_CODE = "COURSE_DUPLICATE_CODE";
      public const string INVALID_TOKEN = "INVALID_TOKEN";
      public const string INVALID_STUDENT_SELF_SIGN_KEY = "INVALID_STUDENT_SELF_SIGN_KEY";
      public const string DUPLICATE_FINAL_GRADE = "DUPLICATE_FINAL_GRADE";
      public const string TEACHER_EMAIL_ALREADY_EXISTS = "TEACHER_EMAIL_ALREADY_EXISTS ";
      public const string PASSWORD_REQUIREMENTS_NOT_FULFILLED = "PASSWORD_REQUIREMENTS_NOT_FULFILLED";
      public const string DUPLICATE_ATTENDANCE_DAY_SELF_SIGN = "DUPLICATE_ATTENDANCE_DAY_SELF_SIGN";
      public const string ATTENDANCE_SELF_SIGN_ALREADY_VERIFIED = "ATTENDANCE_SELF_SIGN_ALREADY_VERIFIED";
      public const string STUDENT_NOT_IN_COURSE = "STUDENT_NOT_IN_COURSE";

      public const string NOT_FOUND_COURSE = "NOT_FOUND_COURSE";
      public const string NOT_FOUND_STUDENT = "NOT_FOUND_STUDENT";
      public const string NOT_FOUND_TEACHER = "NOT_FOUND_TEACHER";
      public const string NOT_FOUND_TASK = "NOT_FOUND_TASK";
      public const string NOT_FOUND_ATTENDANCE = "NOT_FOUND_ATTENDANCE";
      public const string NOT_FOUND_ATTENDANCE_DAY = "NOT_FOUND_ATTENDANCE_DAY";
      public const string NOT_FOUND_UNKNOWN = "NOT_FOUND_UNKNOWN";

      public const string CLOUDFLARE_TURNISTILLE_VERIFICATION_ERROR = "CLOUDFLARE_TURNISTILLE_VERIFICATION_ERROR";
    }

    public readonly static Dictionary<NotFoundException.InstanceType, string> INSTANCE_TYPE_TO_ERROR_KEYS = new()
    {
      { NotFoundException.InstanceType.Course, ErrorKeys.NOT_FOUND_COURSE },
      { NotFoundException.InstanceType.Student, ErrorKeys.NOT_FOUND_STUDENT },
      { NotFoundException.InstanceType.Teacher, ErrorKeys.NOT_FOUND_TEACHER },
      { NotFoundException.InstanceType.Task, ErrorKeys.NOT_FOUND_TASK },
      { NotFoundException.InstanceType.Attendance, ErrorKeys.NOT_FOUND_ATTENDANCE },
      { NotFoundException.InstanceType.AttendanceDay, ErrorKeys.NOT_FOUND_ATTENDANCE_DAY },
      { NotFoundException.InstanceType.UNKNOWN, ErrorKeys.NOT_FOUND_UNKNOWN }
    };

    private class ErrorData(HttpStatusCode statusCode, string? key = null, string? param = null)
    {
      public HttpStatusCode StatusCode { get; init; } = statusCode;
      public string? ErrorKey { get; init; } = key;
      public string? Param { get; init; } = param;
      public DateTime TimeStamp { get; } = DateTime.UtcNow;
    }


    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(RequestDelegate next, ILogger<GlobalExceptionHandler> logger)
    {
      _next = next;
      _logger = logger;
    }

    public async System.Threading.Tasks.Task InvokeAsync(HttpContext context)
    {
      try
      {
        await _next(context); // continue down the pipeline
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "An unhandled exception occurred while processing the request");
        await HandleExceptionAsync(context, ex);
      }
    }

    private static System.Threading.Tasks.Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
      var response = context.Response;
      response.ContentType = "application/json";

      // Customize status codes depending on exception type
      ErrorData errorData = ex switch
      {
        BadDataException => ConvertBadDataException((BadDataException)ex),
        ServerException => ConvertServerException((ServerException)ex),
        ArgumentNullException => new ErrorData(HttpStatusCode.InternalServerError, ErrorKeys.INTERNAL_SERVER_ERROR, "?-null"),
        ArgumentException => new ErrorData(HttpStatusCode.InternalServerError, ErrorKeys.INTERNAL_SERVER_ERROR, "?-arg"),
        _ => new ErrorData(HttpStatusCode.InternalServerError, ErrorKeys.INTERNAL_SERVER_ERROR, "?-server-error-generic")
      };

      // ✅ Nastavit HTTP status code
      response.StatusCode = (int)errorData.StatusCode;

      var result = JsonSerializer.Serialize(
        errorData,
        new JsonSerializerOptions
        {
          PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

      return response.WriteAsync(result);
    }

    private static ErrorData ConvertServerException(ServerException e)
    {
      static ErrorData convertCloudflareTurnistilleException(CloudflareTurnistilleException e)
      {
        ErrorData ret = e switch
        {
          CloudflareTurnistilleKeyEmptyException => new ErrorData(
            HttpStatusCode.InternalServerError,
            ErrorKeys.INTERNAL_SERVER_ERROR,
            "cloudflare-turnistille-key-empty"
            ),
          CloudflareTurnistilleTokenEmptyException => new ErrorData(
            HttpStatusCode.InternalServerError,
            ErrorKeys.INTERNAL_SERVER_ERROR,
            $"cloudflare-turnistille-token-empty"
            ),
          CloudflareTurnistilleVerifyException ctve => new ErrorData(
            HttpStatusCode.InternalServerError,
            ErrorKeys.CLOUDFLARE_TURNISTILLE_VERIFICATION_ERROR,
            string.Join(",", ctve.ErrorCodes)
            ),
          _ => new ErrorData(HttpStatusCode.InternalServerError,
            ErrorKeys.INTERNAL_SERVER_ERROR,
            "?-cloudflare-turnistille-exception")
        };
        return ret;
      }

      ErrorData ret;

      ret = e switch
      {
        CloudflareTurnistilleException => convertCloudflareTurnistilleException((CloudflareTurnistilleException)e),
        ServerException => new ErrorData(HttpStatusCode.InternalServerError,
                                         ErrorKeys.INTERNAL_SERVER_ERROR),
        _ => new ErrorData(HttpStatusCode.InternalServerError,
          ErrorKeys.INTERNAL_SERVER_ERROR,
          "?-server-exception")
      };

      return ret;
    }

    private static ErrorData ConvertBadDataException(BadDataException ex)
    {
      static ErrorData convertCommonBadDataException(Exception e)
      {
        TokenType[] authTokenTypes = new[] { TokenType.StudentLogin, TokenType.StudentAccess, TokenType.TeacherRefresh };
        ErrorData ret = e switch
        {
          InvalidCredentialsException => new ErrorData(
            HttpStatusCode.Unauthorized,
            ErrorKeys.INVALID_CREDENTIALS
            ),
          StudentNotInCourseException snice => new ErrorData(
            HttpStatusCode.BadRequest,
            ErrorKeys.STUDENT_NOT_IN_COURSE,
            $"{snice.StudentNumber} / {snice.CourseCode}"
            ),
          InvalidStudentSelfSignKeyException => new ErrorData(
            HttpStatusCode.Unauthorized,
            ErrorKeys.INVALID_STUDENT_SELF_SIGN_KEY
            ),
          InvalidTokenException ete => new ErrorData(
            authTokenTypes.Contains(ete.TokenType) ? HttpStatusCode.Unauthorized : HttpStatusCode.BadRequest,
            ErrorKeys.INVALID_TOKEN
            ),
          PasswordsRequirementsNotFulfilledException => new ErrorData(
            HttpStatusCode.BadRequest,
            ErrorKeys.PASSWORD_REQUIREMENTS_NOT_FULFILLED),
          AttendanceDaySelfSignAlreadyVerifiedException => new ErrorData(
            HttpStatusCode.Conflict,
            ErrorKeys.ATTENDANCE_SELF_SIGN_ALREADY_VERIFIED),
          _ => new ErrorData(
            HttpStatusCode.BadRequest,
            ErrorKeys.INTERNAL_SERVER_ERROR,
            "?bad-request-common"
            )
        };
        return ret;
      }

      static ErrorData convertDuplicateEntityException(DuplicateItemException e)
      {
        ErrorData ret;
        if (e is DuplicateCourseCodeException tmpA)
          ret = new ErrorData(
            HttpStatusCode.Conflict,
            ErrorKeys.COURSE_DUPLICATE_CODE,
            tmpA.CourseCode
            );
        else if (e is DuplicateFinalGradeForCourseAndStudent)
          ret = new ErrorData(
            HttpStatusCode.Conflict,
            ErrorKeys.DUPLICATE_FINAL_GRADE
            );
        else if (e is TeacherEmailAlreadyRegisteredException tmpB)
          ret = new ErrorData(
            HttpStatusCode.Conflict,
            ErrorKeys.TEACHER_EMAIL_ALREADY_EXISTS,
            tmpB.Email
            );
        else if (e is DuplicateAttendanceDaySelfSignException tmpC)
        {
          ret = new ErrorData(
            HttpStatusCode.Conflict,
            ErrorKeys.DUPLICATE_ATTENDANCE_DAY_SELF_SIGN);
        }
        else
        {
          return new ErrorData(
            HttpStatusCode.Conflict,
            ErrorKeys.INTERNAL_SERVER_ERROR,
            "?-bad-request-duplicate"
            );
        }
        return ret;
      }

      static ErrorData convertNotFoundException(NotFoundException e)
      {
        EAssert.IsTrue(
          INSTANCE_TYPE_TO_ERROR_KEYS.ContainsKey(e.Type),
          $"Unhandled NotFoundException.InstanceType '{e.Type}' in GlobalExceptionHandler");
        string errorKey = INSTANCE_TYPE_TO_ERROR_KEYS[e.Type];
        string? id = e.Type == NotFoundException.InstanceType.UNKNOWN ? "?-not-found-unknown" : e.Identifier?.ToString();
        ErrorData ret = new(HttpStatusCode.NotFound, errorKey, id);
        return ret;
      }

      ErrorData ret = ex switch
      {
        DuplicateItemException => convertDuplicateEntityException((DuplicateItemException)ex),
        NotFoundException => convertNotFoundException((NotFoundException)ex),
        _ => convertCommonBadDataException(ex)
      };

      return ret;
    }
  }
}
