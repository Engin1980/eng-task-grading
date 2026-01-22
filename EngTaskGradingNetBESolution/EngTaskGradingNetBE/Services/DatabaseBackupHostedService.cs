namespace EngTaskGradingNetBE.Services
{
  public class DatabaseBackupHostedService(
    IServiceScopeFactory serviceScopeFactory,
    ILogger<DatabaseBackupHostedService> logger) : BackgroundService
  {
    private const int BACKUP_TEST_INTERVAL_HOURS = 3;
    private const int BACKUP_STARTUP_DELAY_SECONDS = 10;

    protected override async System.Threading.Tasks.Task ExecuteAsync(CancellationToken stoppingToken)
    {
      TimeSpan interval = TimeSpan.FromHours(BACKUP_TEST_INTERVAL_HOURS);
      while (!stoppingToken.IsCancellationRequested)
      {
        logger.LogDebug("Waiting at backup initial delay.");
        await Task.Delay(BACKUP_STARTUP_DELAY_SECONDS * 1000, stoppingToken); //TODO increase
        logger.LogDebug("Initial backup delay elapse.");

        using var scope = serviceScopeFactory.CreateScope();
        var databaseBackupService = scope.ServiceProvider.GetRequiredService<DatabaseBackupService>();
        if (await databaseBackupService.IsBackupNeededAsync() == false)
          logger.LogInformation("Database Backup not needed at this moment, skipping.");
        else
        {
          logger.LogInformation("Invoking database backup.");
          await DoDatabaseBackupAsync(databaseBackupService);
        }

        logger.LogInformation("Entering database backup interval sleep.");
        await System.Threading.Tasks.Task.Delay(interval, stoppingToken);
      }
    }

    private async System.Threading.Tasks.Task DoDatabaseBackupAsync(DatabaseBackupService databaseBackupService)
    {
      try
      {
        logger.LogDebug("Starting database backup.");
        await databaseBackupService.BackupDatabaseAsync();
        logger.LogDebug("Database backup completed.");
      }
      catch (Exception ex)
      {
        logger.Log(LogLevel.Error, ex, "Database backup failed.");
      }
    }
  }
}
