using EngTaskGradingNetBE.Lib;

namespace EngTaskGradingNetBE.Exceptions
{
  public class EntityNotFoundException : AbstractBadDataException
  {
    public EntityNotFoundException(NotFoundErrorKind errorKind, string criterium)
      : base(errorKind, $"'{criterium}' not found.") { }

    public EntityNotFoundException(NotFoundErrorKind errorKind, int id)
      : this(errorKind, $"ID '{id}' not found.") { }

    public EntityNotFoundException(NotFoundErrorKind errorKind, string property, object expectedValue)
      : this(errorKind, $"{property} = '{expectedValue}'") { }
  }
}
