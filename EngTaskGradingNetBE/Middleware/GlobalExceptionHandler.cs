using EngTaskGradingNetBE.Exceptions;
using System.Net;
using System.Text.Json;

namespace EngTaskGradingNetBE.Middleware
{
  public class GlobalExceptionHandler
  {
    private record ErrorData(string Error, int StatusCode);
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
        DuplicateEntityException => new ErrorData($"Conflict - {ex.Message}", (int)HttpStatusCode.Conflict),
        EntityNotFoundException => new ErrorData($"Not Found - {ex.Message}", (int)HttpStatusCode.NotFound),
        UnauthorizedAccessException => new ErrorData("Unauthorized", (int)HttpStatusCode.Unauthorized),
        _ => HandleInternalServerError(ex)
      };

      var result = JsonSerializer.Serialize(new
      {
        error = errorData.Error,
        statusCode = errorData.StatusCode,
      });

      return response.WriteAsync(result);
    }

    private static ErrorData HandleInternalServerError(Exception ex)
    {
      throw new NotImplementedException();
    }
  }
}
