namespace EngTaskGradingNetBE.Exceptions.BadData.NotFound;

public class EntityNotFoundException<T>(object? identifier)
  : NotFoundException(typeof(T), identifier)
{
  public new Type? Type { get; } = typeof(T);
}
