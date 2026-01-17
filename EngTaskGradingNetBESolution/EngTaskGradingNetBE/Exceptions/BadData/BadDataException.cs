namespace EngTaskGradingNetBE.Exceptions.BadData
{
  public class BadDataException(string message, Exception? innerException = null)
    : EngTaskGradingException(message, innerException)
  {
  }
}
