using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Reflection;

namespace EngTaskGradingNetBE.Controllers;

[ApiController]
[Route("api/v1/app")]
public class AppController(HealthService healthService) : ControllerBase
{
  [AllowAnonymous]
  [HttpGet("version")]
  public string GetBackendVersion()
  {
    string ret = Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "unknown";
    return ret;
  }

  [AllowAnonymous]
  [HttpGet("db")]
  public async Task<string> GetDbStateAsync()
  {
    string ret = await healthService.GetDbStateAsync();
    return ret;
  }

  [AllowAnonymous]
  [HttpGet("email")]
  public async Task<string> GetEmailStateAsync()
  {
    string ret = await healthService.GetEmailStateAsync();
    return ret;
  }
}
