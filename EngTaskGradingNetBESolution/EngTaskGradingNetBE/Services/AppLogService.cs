using EngTaskGradingNetBE.Models.DbModel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EngTaskGradingNetBE.Services
{
  public class AppLogService([FromServices] AppDbContext context) : DbContextBaseService(context)
  {
    public async Task<List<AppLog>> GetAllLogsAsync()
    {
      return await Db.AppLog
        .OrderByDescending(log => log.TimeStamp!.Value)
        .ToListAsync();
    }
  }
}
