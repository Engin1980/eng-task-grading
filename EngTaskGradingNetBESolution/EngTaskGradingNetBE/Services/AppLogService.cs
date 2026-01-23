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

    internal async System.Threading.Tasks.Task DeleteAllLogsAsync()
    {
      await Db.AppLog.ExecuteDeleteAsync();
    }

    internal async System.Threading.Tasks.Task DeleteOldLogsAsync()
    {
      // old are over 7 days //TODO move to config
      await Db.AppLog
        .Where(q => q.TimeStamp == null || q.TimeStamp < DateTime.UtcNow.AddDays(-7))
        .ExecuteDeleteAsync();
    }
  }
}
