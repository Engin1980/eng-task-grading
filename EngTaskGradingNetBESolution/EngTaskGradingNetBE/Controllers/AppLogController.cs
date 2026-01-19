using EngTaskGradingNetBE.Lib;
using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;
using EngTaskGradingNetBE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EngTaskGradingNetBE.Controllers;

[ApiController]
[Authorize(Roles = Roles.TEACHER_ROLE)]
[Route("api/v1/[controller]")]
public class AppLogController(AppLogService appLogService) : ControllerBase
{
  [HttpGet]
  public async Task<IEnumerable<AppLogDto>> GetAllLogsAsync()
  {
    var logs = await appLogService.GetAllLogsAsync();
    var ret = logs.Select(EObjectMapper.To).ToList();
    return ret;
  }
}
