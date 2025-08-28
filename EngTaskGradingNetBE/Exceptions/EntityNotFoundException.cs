using EngTaskGradingNetBE.Lib;

namespace EngTaskGradingNetBE.Exceptions
{
  public class EntityNotFoundException : Exception
  {
    public Type EntityType { get; init; }
    public string Criterium { get; init; }

    public EntityNotFoundException(Type entityType, string criterium)
      : base($"Entity of type {entityType.Name} with criterium '{criterium}' was not found.")
    {
      EAssert.Arg.IsNotNull(entityType, nameof(entityType));
      EAssert.Arg.IsNotEmpty(criterium, nameof(criterium));

      EntityType = entityType;
      Criterium = criterium;
    }

    public EntityNotFoundException(Type entityType, int id)
      : this(entityType, $"Entity of type {entityType.Name} with ID '{id}' was not found.") { }

    public EntityNotFoundException(Type entityType, string property, object expectedValue)
      : this(entityType, $"{property} = '{expectedValue}'") { }
  }
}
