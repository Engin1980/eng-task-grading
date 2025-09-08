using System;
using System.Collections.Concurrent;

namespace EngTaskGradingNetBE.Services
{
  public class BackgroundTaskQueue
  {
    private readonly ConcurrentQueue<Func<CancellationToken, ValueTask>> _workItems = new();
    private readonly SemaphoreSlim _signal = new(0);

    public ValueTask Enqueue(Func<CancellationToken, ValueTask> workItem)
    {
      ArgumentNullException.ThrowIfNull(workItem);
      _workItems.Enqueue(workItem);
      _signal.Release();
      return ValueTask.CompletedTask;
    }

    public async ValueTask<Func<CancellationToken, ValueTask>> DequeueAsync(CancellationToken cancellationToken)
    {
      await _signal.WaitAsync(cancellationToken);
      _workItems.TryDequeue(out var workItem);
      return workItem!;
    }
  }

  public class BackgroundTaskManagerService(BackgroundTaskQueue taskQueue, ILogger<BackgroundTaskManagerService> logger) : BackgroundService
  {
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
      logger.LogInformation("BackgroundTaskManagerService started");
      await BackgroundProcessing(stoppingToken);
    }

    private async Task BackgroundProcessing(CancellationToken stoppingToken)
    {
      while (!stoppingToken.IsCancellationRequested)
      {
        try
        {
          var workItem = await taskQueue.DequeueAsync(stoppingToken);
          await workItem(stoppingToken);
        }
        catch (OperationCanceledException)
        {
          // Expected when cancellation is requested
        }
        catch (Exception ex)
        {
          logger.LogError(ex, "Error occurred executing background work item");
        }
      }
    }
  }
}
