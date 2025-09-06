using EngTaskGradingNetBE.Exceptions;
using System.Net;
using System.Text.Json;

namespace EngTaskGradingNetBE.Middleware
{
  public class GlobalExceptionHandler
  {
    private record ErrorData(HttpStatusCode StatusCode, string Error);
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
        DuplicateEntityException => new ErrorData(HttpStatusCode.Conflict, $"Conflict - {ex.Message}"),
        EntityNotFoundException => new ErrorData(HttpStatusCode.NotFound, $"Not Found - {ex.Message}"),
        UnauthorizedAccessException => new ErrorData(HttpStatusCode.Unauthorized, "Unauthorized"),
        BadDataException => new ErrorData(HttpStatusCode.BadRequest, $"Bad Request - {ex.Message}"),
        _ => HandleInternalServerError(ex)
      };

      // ✅ Nastavit HTTP status code
      response.StatusCode = (int)errorData.StatusCode;

      var result = JsonSerializer.Serialize(new
      {
        error = errorData.Error,
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
      return new(HttpStatusCode.InternalServerError, "Internal server error: " + ex.GetMessagesRecursively());
    }
  }
}
