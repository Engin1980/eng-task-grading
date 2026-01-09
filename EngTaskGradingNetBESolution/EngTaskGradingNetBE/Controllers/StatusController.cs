using Microsoft.AspNetCore.Mvc;

namespace EngTaskGradingNetBE.Controllers;

[ApiController]
[Route("api/v1/status")]
public class StatusController
{
  [HttpGet]
  public IActionResult GetStatus()
  {
    return new JsonResult(new { status = "OK", timestamp = System.DateTime.UtcNow });
  }

  [HttpGet("ping")]
  public IActionResult Ping()
  {
    return new JsonResult(new { pong = true, timestamp = System.DateTime.UtcNow });
  }

  [HttpGet("health")]
  public IActionResult Health()
  {
    //TODO implement in more complex way
    return new JsonResult(new { healthy = true, timestamp = System.DateTime.UtcNow });
  }
}