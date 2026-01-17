namespace EngTaskGradingNetBE.Exceptions.BadData.Common;

public class InvalidTokenException(InvalidTokenException.InvalidationType invalidationType) : BadDataException($"Token not valid : {invalidationType}.")
{
  public enum InvalidationType
  {
    Expired,
    NotFound,
    InvalidOwner
  }

  public InvalidationType Type { get; } = invalidationType;
}
