namespace EngTaskGradingNetBE.Exceptions.Server;

public class ServerException(string message, Exception? innerException)
  : EngTaskGradingException(message, innerException)
{
}
