using EngTaskGradingNetBE.Lib;

namespace EngTaskGradingNetBE.Exceptions
{
  public class CommonBadDataException : AbstractBadDataException
  {
    public CommonBadDataException(CommonErrorKind errorKind, string additionalData) : base(errorKind, additionalData)
    {
    }
  }
}
