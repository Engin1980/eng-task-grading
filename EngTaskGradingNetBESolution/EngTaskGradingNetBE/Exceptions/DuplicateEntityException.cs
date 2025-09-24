using EngTaskGradingNetBE.Lib;

namespace EngTaskGradingNetBE.Exceptions
{
  public class DuplicateEntityException : AbstractBadDataException
  {
    public DuplicateEntityException(AlreadyExistsErrorKind errorKind, string additionalData) : base(errorKind, additionalData) { }
  }
}
