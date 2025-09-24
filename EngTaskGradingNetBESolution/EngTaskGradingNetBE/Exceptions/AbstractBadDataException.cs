using EngTaskGradingNetBE.Lib;

namespace EngTaskGradingNetBE.Exceptions
{
  public abstract class AbstractBadDataException(IErrorKind errorKind, string additionalData) : Exception($"Bad data error of kind '{errorKind.Key}' occurred. Additional data: {additionalData}")
  {
    public IErrorKind ErrorKind { get; } = errorKind;
    public string AdditionalData { get; } = additionalData;
    public AbstractBadDataException(IErrorKind errorKind)
      : this(errorKind, string.Empty) { }
  }
}
