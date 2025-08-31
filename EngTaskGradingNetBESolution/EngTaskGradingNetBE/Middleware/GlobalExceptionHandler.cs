using EngTaskGradingNetBE.Exceptions;
using System.Net;
using System.Text.Json;

namespace EngTaskGradingNetBE.Middleware
{
  public class GlobalExceptionHandler
  {

    private record ErrorData(HttpStatusCode StatusCode, string Error);
    private readonly RequestDelegate _next;

    public GlobalExceptionHandler(RequestDelegate next)
    {
      _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
      try
      {
        await _next(context); // continue down the pipeline
      }
      catch (Exception ex)
      {
        await HandleExceptionAsync(context, ex);
      }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception ex)
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

      var result = JsonSerializer.Serialize(new
      {
        error = errorData.Error,
        statusCode = (int)errorData.StatusCode,
      });

      return response.WriteAsync(result);
    }

    private static ErrorData HandleInternalServerError(Exception ex)
    {
      return new(HttpStatusCode.InternalServerError, "Internal server error: " + ex.GetMessagesRecursively());
    }
  }
}
