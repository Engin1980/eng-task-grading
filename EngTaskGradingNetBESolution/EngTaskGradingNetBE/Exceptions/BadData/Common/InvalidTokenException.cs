namespace EngTaskGradingNetBE.Exceptions.BadData.Common;

public class InvalidTokenException(
  InvalidTokenException.ETokenType tokenType,
  InvalidTokenException.EInvalidationType invalidationType) : BadDataException($"Token not valid : {invalidationType}.")
{
  public enum ETokenType
  {
    Authentication,
    Validation
  }

  public enum EInvalidationType
  {
    Expired,
    NotFound,
    InvalidOwner
  }

  public EInvalidationType InvalidationType { get; } = invalidationType;
  public ETokenType TokenType { get; } = tokenType;
}
