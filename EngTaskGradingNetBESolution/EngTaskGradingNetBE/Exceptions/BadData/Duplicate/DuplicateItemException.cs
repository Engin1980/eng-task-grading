using EngTaskGradingNetBE.Exceptions.BadData;
using EngTaskGradingNetBE.Lib;

namespace EngTaskGradingNetBE.Exceptions.BadData.Duplicate;

public abstract class DuplicateItemException(string message, Exception? innerException = null)
  : BadDataException(message, innerException)
{
}
