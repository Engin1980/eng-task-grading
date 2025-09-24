using EngTaskGradingNetBE.Exceptions;
using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Mvc;

namespace EngTaskGradingNetBE.Controllers
{
  [ApiController]
  [Route("api/v1/auth")]
  public class AuthController(
    AuthService authService,
    Logger<AuthController> logger)
  {
    [HttpPost("login")]
    public async Task<AuthorizedDto> LoginAsync([FromBody] TeacherLoginDto request)
    {
      var tmp = await authService.LoginAsync(request.Email, request.Password);
      AuthorizedDto ret = EObjectMapper.To(tmp);
      return ret;
    }

    [HttpPost("refresh")]
    public async Task<TokensDto> RefreshAsync(string refreshToken)
    {
      var tmp = await authService.RefreshAsync(refreshToken);
      TokensDto ret = EObjectMapper.To(tmp);
      return ret;
    }

    [HttpPost("logout")]
    public async System.Threading.Tasks.Task LogoutAsync(string refreshToken)
    {
      await authService.LogoutAsync(refreshToken);
    }

    [HttpPost("request-password-reset")]
    public async System.Threading.Tasks.Task RequestPasswordResetAsync(string email)
    {
      try
      {
        await authService.InvokePasswordResetProcedure(email);
      }
      catch (EntityNotFoundException)
      {
        logger.LogWarning($"Password reset requested for non-existing email {email}.");
        return; // ignore to prevent user enumeration
      }
      catch (Exception ex)
      {
        logger.LogError(ex, $"Failed to process password reset request for {email}.");
        return; // ignore to prevent user enumeration
      }
    }
  }
}
