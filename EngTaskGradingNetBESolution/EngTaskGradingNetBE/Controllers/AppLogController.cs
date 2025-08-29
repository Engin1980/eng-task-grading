using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EngTaskGradingNetBE.Controllers;

[ApiController]
[Route("api/v1/applog")]
public class AppLogController(AppLogService appLogService) : ControllerBase
{
  [HttpGet]
  public async Task<ActionResult<IEnumerable<AppLog>>> GetAllLogs()
  {
    var logs = await appLogService.GetAllLogsAsync();
    return Ok(logs);
  }
}
