namespace EngTaskGradingNetBE.Exceptions.BadData.Common;

public class InvalidStudentSelfSignKeyException(string key) : BadDataException("Invalid student self-sign key.")
{
  public string Key { get; } = key;
}
