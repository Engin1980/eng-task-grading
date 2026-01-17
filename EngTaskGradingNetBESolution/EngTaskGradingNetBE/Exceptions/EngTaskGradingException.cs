namespace EngTaskGradingNetBE.Exceptions
{
  public class EngTaskGradingException(string message, Exception? innerException = null) 
    : Exception(message, innerException) { }
}
