using EngTaskGradingNetBE.Lib;

namespace EngTaskGradingNetBE.Exceptions
{
  public class DuplicateEntityException : Exception
  {
    public Type EntityType { get; init; }
    public DuplicateEntityException(Type entityType, string message) : base(message)
    {
      EAssert.Arg.IsNotNull(entityType, nameof(entityType));
      EAssert.Arg.IsNotEmpty(message, nameof(message));

      EntityType = entityType;
    }

  }
}
