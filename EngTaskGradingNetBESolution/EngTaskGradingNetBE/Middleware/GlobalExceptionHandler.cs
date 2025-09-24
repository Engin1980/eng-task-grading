using EngTaskGradingNetBE.Exceptions;
using EngTaskGradingNetBE.Lib;
using System.Net;
using System.Text.Json;

namespace EngTaskGradingNetBE.Middleware
{
  public class GlobalExceptionHandler
  {
    private class ErrorData(HttpStatusCode StatusCode, IErrorKind? errorKind, string? additionalData)
    {
      public HttpStatusCode StatusCode { get; init; } = StatusCode;
      public string? Key { get; init; } = errorKind?.Key;
      public string? AdditionalData { get; init; } = additionalData;

      public ErrorData(HttpStatusCode statusCode) : this(statusCode, null, null) { }
      public ErrorData(HttpStatusCode statusCode, IErrorKind kind) : this(statusCode, kind, null) { }
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
        ArgumentNullException => HandleInternalServerError(ex),
        ArgumentException => HandleInternalServerError(ex),
        InvalidCredentialsException => new ErrorData(HttpStatusCode.Unauthorized),
        AbstractBadDataException => new ErrorData(HttpStatusCode.BadRequest, (ex as AbstractBadDataException)!.ErrorKind, (ex as AbstractBadDataException)!.AdditionalData),
        UnauthorizedAccessException => new ErrorData(HttpStatusCode.Unauthorized),
        StudentTokenInvalidException => new ErrorData(HttpStatusCode.Unauthorized),
        _ => HandleInternalServerError(ex)
      };

      // ✅ Nastavit HTTP status code
      response.StatusCode = (int)errorData.StatusCode;

      var result = JsonSerializer.Serialize(new
      {
        error = errorData.Key,
        statusCode = (int)errorData.StatusCode,
        timestamp = DateTime.UtcNow
      }, new JsonSerializerOptions
      {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
      });

      return response.WriteAsync(result);
    }

    private static ErrorData HandleInternalServerError(Exception ex)
    {
      //TODO message only for debugging
      return new(HttpStatusCode.InternalServerError, InternalErrorKind.Unknown, ex.Message);
    }
  }
}
