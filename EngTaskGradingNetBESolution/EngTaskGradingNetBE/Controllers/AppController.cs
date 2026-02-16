using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Reflection;

namespace EngTaskGradingNetBE.Controllers;

[ApiController]
[Route("api/v1/app")]
public class AppController : ControllerBase
{
  [AllowAnonymous]
  [HttpGet("version")]
  public string GetBackendVersion()
  {
    string ret = Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "unknown";
    return ret;
  }
}
