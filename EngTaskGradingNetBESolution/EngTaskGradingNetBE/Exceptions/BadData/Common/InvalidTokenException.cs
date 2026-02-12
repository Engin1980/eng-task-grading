using EngTaskGradingNetBE.Services;

namespace EngTaskGradingNetBE.Exceptions.BadData.Common;

public enum InvalidationType
{
  Expired,
  NotFound,
  InvalidOwner
}

public class InvalidTokenException(
  TokenType tokenType,
  InvalidationType invalidationType) 
  : BadDataException($"Token not valid : {invalidationType}.")
{
  public InvalidationType InvalidationType { get; } = invalidationType;
  public TokenType TokenType { get; } = tokenType;
}
